import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { ApiError } from '../utils/apiError.utils.js'
import { ApiStatusCode, ApiErrorMessages, ApiSuccessMessages } from '../constants/api.constants.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { days } from '../model/days.model.js'
import { exercise } from '../model/exercise.model.js'

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
      console.log(existingExercise)
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

  const exercises = await exercise.find({ dayId, userId }).skip(offsetNum).limit(limitNum)

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

  res.status(ApiStatusCode.Success).json({
    statusCode: ApiStatusCode.Success,
    message: ApiSuccessMessages.ExerciseDeleted,
  })
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

  if (removedVideos.length > 0) {
    exerciseData.videoRecommendations = exerciseData.videoRecommendations.filter(
      (video) => !removedVideos.includes(video),
    )
  }

  if (newAddedVideos.length > 0) {
    exerciseData.videoRecommendations = [...exerciseData.videoRecommendations, ...newAddedVideos]
  }


  await exerciseData.save()

  res.status(ApiStatusCode.Success).json({
    statusCode: ApiStatusCode.Success,
    data: exerciseData,
    message: ApiSuccessMessages.ExerciseUpdated,
  })
})

export { addExercise, getExercisesByDay, deleteExercise, updateExercise }
