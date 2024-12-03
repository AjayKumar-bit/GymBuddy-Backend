import { ApiError } from '../utils/apiError.utils.js'
import { ApiErrorMessages, ApiStatusCode, ApiSuccessMessages } from '../constants/api.constants.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { days } from '../model/days.model.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import mongoose from 'mongoose'
import { exercise } from '../model/exercise.model.js'

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
      statusCode: ApiStatusCode.DuplicateEntries,
      message: ApiErrorMessages.DayAlreadyExist,
    })
  }

  const day = new days({
    userId: _id,
    dayName,
  })

  day.save()

  const dayData = day.toObject()
  delete dayData.userId

  res.status(ApiStatusCode.Created).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Created,
      data: dayData,
      message: ApiSuccessMessages.DayAdded,
    }),
  )
})

const getDays = asyncHandler(async (req, res) => {
  const { _id } = req.user

  const data = await days
    .find({ userId: _id })
    .sort({ createdAt: 1 })
    .select('-userId -createdAt -updatedAt -__v')

  if (data.length === 0) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDaysFound,
    })
  }
  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data,
    }),
  )
})

const updateDay = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { dayId, dayName } = req.body

  if (!dayId) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.DayIdMissing,
    })
  }

  if (!dayName) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.DayNameMissing,
    })
  }

  const existingDay = await days.findOne({
    userId: _id,
    dayName,
    _id: dayId,
  })

  if (existingDay) {
    throw new ApiError({
      statusCode: ApiStatusCode.DuplicateEntries,
      message: ApiErrorMessages.DayAlreadyExist,
    })
  }

  const updatedDay = await days
    .findOneAndUpdate(
      { _id: dayId, userId: _id },
      { $set: { dayName } },
      { new: true, runValidators: true },
    )
    .select('-userId -createdAt -updatedAt')

  if (!updatedDay) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.FailedToUpdateDay,
    })
  }

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data: updatedDay,
      message: ApiSuccessMessages.DayUpdated,
    }),
  )
})

const deleteDay = asyncHandler(async (req, res) => {
  const { dayId } = req.body
  const { _id } = req.user

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const day = await days
      .findOneAndDelete({ _id: dayId, userId: _id })
      .select('-userId -createdAt -updatedAt')
      .session(session)
    if (!day) {
      throw new ApiError({
        statusCode: ApiStatusCode.NotFound,
        message: ApiErrorMessages.NoDayFound,
      })
    }

    await exercise.deleteMany({ dayId }).session(session)

    await session.commitTransaction()
    res.status(ApiStatusCode.Success).json(
      new ApiResponse({
        statusCode: ApiStatusCode.Success,
        data: day,
        message: ApiSuccessMessages.DayDeleted,
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

export { addDay, getDays, updateDay, deleteDay }
