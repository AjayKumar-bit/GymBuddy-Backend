import { ApiErrorMessages, ApiStatusCode, ApiSuccessMessages } from '../constants/api.constants.js'
import { User } from '../model/user.model.js'
import { ApiError } from '../utils/apiError.utils.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { generateToken, isValidEmail } from '../utils/common.utils.js'

const registerUser = asyncHandler(async (req, res) => {
  const { name, emailId, password } = req.body

  // checking all required  fields present
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

const loginUser = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body

  // is required field password and email present
  if (!(emailId && password)) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidLoginCred,
    })
  }

  //check is user exist
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

  //generating Token
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

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { name, emailId } = req.body

  // is there nothing to update meant all fields are empty
  if (!name && !emailId) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidData,
    })
  }

  // checking email  is in valid format
  const isEmailValid = emailId ? isValidEmail(emailId) : true
  if (!isEmailValid) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidEmail,
    })
  }

  // checking if user exist
  const userAlreadyExist = emailId ? await User.findOne({ emailId }) : false
  if (userAlreadyExist) {
    throw new ApiError({
      statusCode: ApiStatusCode.DuplicateEntries,
      message: ApiErrorMessages.UserAlreadyRegistered,
    })
  }

  // updating
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

// const deleteUser = asyncHandler(async (req, res) => {
//   const { _id } = req.user
//   const user = await User.deleteOne({ _id })

//   if (!user.acknowledged) {
//     throw new ApiError({
//       statusCode: ApiStatusCode.ServerError,
//       message: ApiErrorMessages.SomethingWentWrong,
//     })
//   }

//   res.status(ApiStatusCode.Success).json(
//     new ApiResponse({
//       statusCode: ApiStatusCode.Success,
//       message: ApiSuccessMessages.UserDeleted,
//     }),
//   )
// })

const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const days = await days.find({ userId: _id }).session(session)
    if (days.length > 0) {
      const dayIds = days.map((day) => day._id)

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

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const { _id } = req.user

  if (!oldPassword || !newPassword || newPassword.trim() === '' || !oldPassword.trim() === '') {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.RequiredFieldMissing,
    })
  }

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
