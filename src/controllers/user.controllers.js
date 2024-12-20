/**
 * @file user.controllers.js
 * @description This file contains the controller functions for handling user-related operations.
 * It includes functions for registering, logging in, logging out, updating, and deleting users,
 * as well as changing passwords and adding planner dates.
 */

import mongoose from 'mongoose'
import { ApiErrorMessages, ApiStatusCode, ApiSuccessMessages } from '../constants/api.constants.js'
import { User } from '../model/user.model.js'
import { ApiError } from '../utils/apiError.utils.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { generateToken, isValidEmail } from '../utils/common.utils.js'
import { days } from '../model/days.model.js'
import { exercise } from '../model/exercise.model.js'

/**
 * @function registerUser
 * @description Registers a new user.
 * @route POST /users/register
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's name
 * @param {string} req.body.emailId - User's email
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @throws {ApiError} If required fields are missing, email is invalid, or user already exists
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, emailId, password } = req.body

  // checking all required fields present
  if ([name, emailId, password].some((item) => !item || item?.trim() === '')) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.RequiredFieldMissing,
    })
  }

  // checking is a valid email format
  if (!isValidEmail(emailId)) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidEmail,
    })
  }

  // is already user registered
  const userAlreadyExist = await User.findOne({ emailId })

  if (userAlreadyExist && userAlreadyExist?.emailId) {
    throw new ApiError({
      statusCode: ApiStatusCode.DuplicateEntries,
      message: ApiErrorMessages.UserAlreadyRegistered,
    })
  }

  // if not register
  const createdUser = await User.create({
    name,
    emailId,
    password,
  })

  createdUser.accessToken = generateToken(createdUser._id.toString())
  createdUser.save()
  const { password: _, ...data } = createdUser.toObject()

  // if user not created
  if (!createdUser) {
    throw new ApiError({
      statusCode: ApiStatusCode.ServerError,
      message: ApiErrorMessages.ErrorWhileCreatingUser,
    })
  }

  res.status(ApiStatusCode.Created).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Created,
      data,
      message: ApiSuccessMessages.UserCreatedSuccessfully,
    }),
  )
})

/**
 * @function loginUser
 * @description Logs in a user.
 * @route POST /users/login
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.emailId - User's email
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @throws {ApiError} If required fields are missing, user is not found, or password is incorrect
 */
const loginUser = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body

  // checking if required fields password and email are present
  if (!(emailId && password)) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidLoginCred,
    })
  }

  // checking if user exists
  const user = await User.findOne({ emailId })
  if (!user) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.UserNotFound,
    })
  }

  // matching password
  const isPasswordCorrect = await user.isPasswordCorrect(password)
  if (!isPasswordCorrect) {
    throw new ApiError({
      statusCode: ApiStatusCode.Unauthorized,
      message: ApiErrorMessages.IncorrectPassword,
    })
  }

  // generating Token
  user.accessToken = await generateToken(user._id.toString())
  user.save()

  const { password: _, ...data } = user.toObject()

  return res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data,
      message: ApiSuccessMessages.LoginSuccessfully,
    }),
  )
})

/**
 * @function logoutUser
 * @description Logs out a user.
 * @route POST /users/logout
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 */
const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  await User.findOneAndUpdate({ _id }, { accessToken: '' }, { new: false })
  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      message: ApiSuccessMessages.LoggedOutSuccessfully,
    }),
  )
})

/**
 * @function updateUser
 * @description Updates a user's profile.
 * @route PATCH /users/updateProfile
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - New name of the user
 * @param {string} req.body.emailId - New email of the user
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If no fields to update, email is invalid, or email already exists
 */
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { name, emailId } = req.body

  // checking if there is nothing to update, meaning all fields are empty
  if (!name && !emailId) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidData,
    })
  }

  // checking if email is in valid format
  const isEmailValid = emailId ? isValidEmail(emailId) : true
  if (!isEmailValid) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidEmail,
    })
  }

  // checking if user already exists
  const userAlreadyExist = emailId ? await User.findOne({ emailId }) : false
  if (userAlreadyExist) {
    throw new ApiError({
      statusCode: ApiStatusCode.DuplicateEntries,
      message: ApiErrorMessages.UserAlreadyRegistered,
    })
  }

  // updating user
  const user = await User.findOneAndUpdate(
    { _id },
    { $set: { name, emailId } },
    { new: true },
  ).select('-password')

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data: user,
      message: ApiSuccessMessages.ProfileUpdated,
    }),
  )
})

/**
 * @function deleteUser
 * @description Deletes a user and their associated data.
 * @route DELETE /users/deleteUser
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If something goes wrong during the deletion process
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const dayData = await days.find({ userId: _id }).session(session)

    if (days.length > 0) {
      const dayIds = dayData.map((day) => day._id)

      await exercise.deleteMany({ dayId: { $in: dayIds } }).session(session)

      await days.deleteMany({ userId: _id }).session(session)
    }

    const user = await User.deleteOne({ _id }).session(session)
    if (!user.acknowledged) {
      throw new ApiError({
        statusCode: ApiStatusCode.ServerError,
        message: ApiErrorMessages.SomethingWentWrong,
      })
    }

    await session.commitTransaction()

    res.status(ApiStatusCode.Success).json(
      new ApiResponse({
        statusCode: ApiStatusCode.Success,
        message: ApiSuccessMessages.UserDeleted,
      }),
    )
  } catch (error) {
    await session.abortTransaction()

    throw new ApiError({
      statusCode: ApiStatusCode.ServerError,
      message: ApiErrorMessages.SomethingWentWrong,
    })
  } finally {
    session.endSession()
  }
})

/**
 * @function addPlannerDate
 * @description Adds a planner start date for the user.
 * @route POST /users/addPlannerDate
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.plannerStartDate - Planner start date
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If user is not found
 */
const addPlannerDate = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { plannerStartDate } = req.body

  const user = await User.findOneAndUpdate(
    { _id },
    { $set: { plannerStartDate } },
    { new: true },
  ).select('-password')

  if (!user) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.UserNotFound,
    })
  }

  user.save()

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data: user,
      message: ApiSuccessMessages.PlannerDateAdded,
    }),
  )
})

/**
 * @function changePassword
 * @description Changes the user's password.
 * @route PATCH /users/changePassword
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.oldPassword - User's old password
 * @param {string} req.body.newPassword - User's new password
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If required fields are missing, old password is incorrect, or new password is the same as the old password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const { _id } = req.user

  // checking if required fields are present
  if (!oldPassword || !newPassword || newPassword.trim() === '' || !oldPassword.trim() === '') {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.RequiredFieldMissing,
    })
  }

  // checking if old password and new password are the same
  if (oldPassword === newPassword) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.SameOldAndNewPassword,
    })
  }

  const user = await User.findById(_id)

  if (!user) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.UserNotFound,
    })
  }

  // checking if old password is correct
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isOldPasswordCorrect) {
    throw new ApiError({
      statusCode: ApiStatusCode.Unauthorized,
      message: ApiErrorMessages.OldPasswordIncorrect,
    })
  }

  user.password = newPassword
  user.accessToken = generateToken(user._id.toString())
  await user.save()

  const { password: _, ...data } = user.toObject()

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data,
      message: ApiSuccessMessages.PasswordChangedSuccessfully,
    }),
  )
})

export {
  addPlannerDate,
  changePassword,
  deleteUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
}
