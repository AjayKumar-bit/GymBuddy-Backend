/**
 * @file days.controllers.js
 * @description This file contains the controller functions for handling day-related operations.
 * It includes functions for adding, updating, retrieving, and deleting days.
 */

import { ApiError } from '../utils/apiError.utils.js'
import { ApiErrorMessages, ApiStatusCode, ApiSuccessMessages } from '../constants/api.constants.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { days } from '../model/days.model.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import mongoose from 'mongoose'
import { exercise } from '../model/exercise.model.js'

/**
 * @function addDay
 * @description Adds a new day to the user's planner.
 * @route POST /days/addDay
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.dayName - Name of the day to be added
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If dayName is missing or if the day already exists
 */
const addDay = asyncHandler(async (req, res) => {
  const { dayName } = req.body
  const { _id } = req.user

  if (!dayName) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.DayNameMissing,
    })
  }

  const existingDay = await days.findOne({
    userId: _id,
    dayName,
  })

  if (existingDay) {
    throw new ApiError({
      statusCode: ApiStatusCode.Conflict,
      message: ApiErrorMessages.DayAlreadyExists,
    })
  }

  const newDay = await days.create({
    userId: _id,
    dayName,
  })

  res.status(ApiStatusCode.Created).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Created,
      message: ApiSuccessMessages.DayAdded,
      data: newDay,
    }),
  )
})

/**
 * @function getDays
 * @description Retrieves all days for the authenticated user.
 * @route GET /days/getDays
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If no days are found
 */
const getDays = asyncHandler(async (req, res) => {
  const { _id } = req.user

  const userDays = await days.find({ userId: _id })

  if (!userDays.length) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDaysFound,
    })
  }

  res.status(ApiStatusCode.OK).json(
    new ApiResponse({
      statusCode: ApiStatusCode.OK,
      message: ApiSuccessMessages.DaysRetrieved,
      data: userDays,
    }),
  )
})

/**
 * @function updateDay
 * @description Updates the name of an existing day.
 * @route PATCH /days/updateDay
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.dayId - ID of the day to be updated
 * @param {string} req.body.dayName - New name of the day
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If dayId or dayName is missing, or if the day does not exist
 */
const updateDay = asyncHandler(async (req, res) => {
  const { dayId, dayName } = req.body
  const { _id } = req.user

  if (!dayId || !dayName) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.DayIdOrNameMissing,
    })
  }

  const dayToUpdate = await days.findOne({
    userId: _id,
    _id: dayId,
  })

  if (!dayToUpdate) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.DayNotFound,
    })
  }

  dayToUpdate.dayName = dayName
  await dayToUpdate.save()

  res.status(ApiStatusCode.OK).json(
    new ApiResponse({
      statusCode: ApiStatusCode.OK,
      message: ApiSuccessMessages.DayUpdated,
      data: dayToUpdate,
    }),
  )
})

/**
 * @function deleteDay
 * @description Deletes an existing day.
 * @route DELETE /days/deleteDay
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.dayId - ID of the day to be deleted
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If dayId is missing or if the day does not exist
 */
const deleteDay = asyncHandler(async (req, res) => {
  const { dayId } = req.body
  const { _id } = req.user

  if (!dayId) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.DayIdMissing,
    })
  }

  const dayToDelete = await days.findOne({
    userId: _id,
    _id: dayId,
  })

  if (!dayToDelete) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.DayNotFound,
    })
  }

  await dayToDelete.remove()

  res.status(ApiStatusCode.OK).json(
    new ApiResponse({
      statusCode: ApiStatusCode.OK,
      message: ApiSuccessMessages.DayDeleted,
    }),
  )
})

export { addDay, getDays, updateDay, deleteDay }
