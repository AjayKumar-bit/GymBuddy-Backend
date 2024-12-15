import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { ApiError } from '../utils/apiError.utils.js'
import { ApiStatusCode, ApiErrorMessages, ApiSuccessMessages } from '../constants/api.constants.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { days } from '../model/days.model.js'
import { exercise } from '../model/exercise.model.js'
import { User } from '../model/user.model.js'
import moment from 'moment'

const addExercise = asyncHandler(async (req, res) => {
  const { dayIds, exerciseDetails, videoRecommendations } = req.body
  const { _id: userId } = req.user

  if (!dayIds || dayIds.length === 0 || !exerciseDetails) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.MissingExerciseData,
    })
  }

  for (const dayId of dayIds) {
    const dayExists = await days.findOne({ _id: dayId, userId })
    if (!dayExists) {
      throw new ApiError({
        statusCode: ApiStatusCode.NotFound,
        message: ApiErrorMessages.InvalidDaySelect,
      })
    }

    // Check if the exercise already exists for the given day
    const existingExercise = await exercise.findOne({
      userId,
      dayId,
      'exerciseDetails.id': exerciseDetails.id,
    })

    if (existingExercise) {
      throw new ApiError({
        statusCode: ApiStatusCode.DuplicateEntries,
        message: `${ApiErrorMessages.ExerciseAlreadyExist} : ${dayExists.dayName}`,
      })
    }

    // Create a new document for the specific day
    const exerciseData = new exercise({
      userId,
      dayId,
      exerciseDetails,
      videoRecommendations: videoRecommendations || [],
    })

    await exerciseData.save()
  }

  res.status(ApiStatusCode.Created).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Created,
      message: ApiSuccessMessages.ExerciseAdded,
    }),
  )
})

const getExercisesByDay = asyncHandler(async (req, res) => {
  const { dayId } = req.params
  const { _id: userId } = req.user

  const { offset = 0, limit = 10 } = req.query

  if (!dayId) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.NoDayFound,
    })
  }

  const offsetNum = parseInt(offset, 10)
  const limitNum = parseInt(limit, 10)

  const exercises = await exercise
    .find({ dayId, userId })
    .sort({ createdAt: 1 })
    .skip(offsetNum)
    .limit(limitNum)

  if (exercises.length === 0) {
    return res.status(ApiStatusCode.NotFound).json(
      new ApiResponse({
        statusCode: ApiStatusCode.NotFound,
        message: ApiSuccessMessages.NoExerciseFound,
        data: [],
      }),
    )
  }

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data: exercises,
    }),
  )
})

const deleteExercise = asyncHandler(async (req, res) => {
  const { dayId, exerciseId } = req.query
  const { _id: userId } = req.user

  const dayExists = await days.findOne({ _id: dayId, userId })
  if (!dayExists) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDayFound,
    })
  }

  const deletedExercise = await exercise.findOneAndDelete({
    userId,
    dayId,
    _id: exerciseId,
  })

  if (!deletedExercise) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoExerciseFound,
    })
  }

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      message: ApiSuccessMessages.ExerciseDeleted,
    }),
  )
})

const updateExercise = asyncHandler(async (req, res) => {
  const { exerciseDetails, removedVideos, newAddedVideos, dayId, exerciseId } = req.body
  const { _id: userId } = req.user

  const dayExists = await days.findOne({ _id: dayId, userId })
  if (!dayExists) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDayFound,
    })
  }

  const exerciseData = await exercise.findOne({ userId, dayId, _id: exerciseId })
  if (!exerciseData) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoExerciseFound,
    })
  }

  exerciseData.exerciseDetails = exerciseDetails
    ? { ...exerciseData.exerciseDetails, ...exerciseDetails }
    : exerciseData.exerciseDetails

  if (!!removedVideos && removedVideos.length > 0) {
    exerciseData.videoRecommendations = exerciseData.videoRecommendations.filter((video) => {
      return !removedVideos.includes(video.videoId)
    })
  }

  if (!!newAddedVideos && newAddedVideos.length > 0) {
    exerciseData.videoRecommendations = [...exerciseData.videoRecommendations, ...newAddedVideos]
  }

  await exerciseData.save()

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data: exerciseData,
      message: ApiSuccessMessages.ExerciseUpdated,
    }),
  )
})

const getTodayExercises = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user

  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NotAValidUser,
    })
  }

  const allDays = await days.find({ userId }).sort({ createdAt: 1 })

  if (!allDays.length) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.AddDayFirst,
    })
  }

  if (!user.plannerStartDate) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.PlannerDateMissing,
    })
  }

  const plannerStartDate = moment(user.plannerStartDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ')
  const today = moment()

  const dayDifference = today.diff(plannerStartDate, 'days')

  if (dayDifference < 0) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.StartDateInFuture,
    })
  }

  const currentDayIndex = dayDifference % allDays.length
  const currentDay = allDays[currentDayIndex]

  if (!currentDay) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDaysFound,
    })
  }

  const exercises = await exercise.find({ userId, dayId: currentDay._id }).sort({ createdAt: 1 })

  if (!exercises && exercises.length) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoExerciseFound,
    })
  }

  res.status(ApiStatusCode.Success).json(
    new ApiResponse({
      statusCode: ApiStatusCode.Success,
      data: exercises,
    }),
  )
})

export { addExercise, getExercisesByDay, deleteExercise, updateExercise, getTodayExercises }
