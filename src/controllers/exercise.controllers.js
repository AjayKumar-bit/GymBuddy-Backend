/**
 * @file exercise.controllers.js
 * @description This file contains the controller functions for handling exercise-related operations.
 * It includes functions for adding, updating, retrieving, and deleting exercises.
 */

import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { ApiError } from '../utils/apiError.utils.js'
import { ApiStatusCode, ApiErrorMessages, ApiSuccessMessages } from '../constants/api.constants.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { days } from '../model/days.model.js'
import { exercise } from '../model/exercise.model.js'
import { User } from '../model/user.model.js'
import moment from 'moment'

/**
 * @function addExercise
 * @description Adds a new exercise to the specified days.
 * @route POST /exercise/addExercise
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array<string>} req.body.dayIds - Array of day IDs
 * @param {Object} req.body.exerciseDetails - Exercise details
 * @param {Array<Object>} [req.body.videoRecommendations] - Array of video recommendations
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If required fields are missing or if the exercise already exists for the given day
 */
const addExercise = asyncHandler(async (req, res) => {
  const { dayIds, exerciseDetails, videoRecommendations } = req.body
  const { _id: userId } = req.user

  // checking if required fields are present
  if (!dayIds || dayIds.length === 0 || !exerciseDetails) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.MissingExerciseData,
    })
  }

  for (const dayId of dayIds) {
    // checking if the day exists
    const dayExists = await days.findOne({ _id: dayId, userId })
    if (!dayExists) {
      throw new ApiError({
        statusCode: ApiStatusCode.NotFound,
        message: ApiErrorMessages.InvalidDaySelect,
      })
    }

    // checking if the exercise already exists for the given day
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

    // creating a new document for the specific day
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

/**
 * @function getExercisesByDay
 * @description Retrieves exercises for a specific day.
 * @route GET /exercise/exercises/:dayId
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.dayId - Day ID
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.offset=0] - Offset for pagination
 * @param {number} [req.query.limit=10] - Limit for pagination
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If dayId is missing or if no exercises are found
 */
const getExercisesByDay = asyncHandler(async (req, res) => {
  const { dayId } = req.params
  const { _id: userId } = req.user

  const { offset = 0, limit = 10 } = req.query

  // checking if dayId is present
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

/**
 * @function deleteExercise
 * @description Deletes an exercise from a specific day.
 * @route DELETE /exercise/deleteExercise
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.dayId - Day ID
 * @param {string} req.query.exerciseId - Exercise ID
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If dayId or exerciseId is missing, or if the exercise does not exist
 */
const deleteExercise = asyncHandler(async (req, res) => {
  const { dayId, exerciseId } = req.query
  const { _id: userId } = req.user

  // checking if the day exists
  const dayExists = await days.findOne({ _id: dayId, userId })
  if (!dayExists) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDayFound,
    })
  }

  // deleting the exercise
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

/**
 * @function updateExercise
 * @description Updates an existing exercise.
 * @route PATCH /exercise/updateExercise
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object} req.body.exerciseDetails - Updated exercise details
 * @param {Array<string>} req.body.removedVideos - Array of video IDs to be removed
 * @param {Array<Object>} req.body.newAddedVideos - Array of new video recommendations
 * @param {string} req.body.dayId - Day ID
 * @param {string} req.body.exerciseId - Exercise ID
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If dayId or exerciseId is missing, or if the exercise does not exist
 */
const updateExercise = asyncHandler(async (req, res) => {
  const { exerciseDetails, removedVideos, newAddedVideos, dayId, exerciseId } = req.body
  const { _id: userId } = req.user

  // checking if the day exists
  const dayExists = await days.findOne({ _id: dayId, userId })
  if (!dayExists) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoDayFound,
    })
  }

  // checking if the exercise exists
  const exerciseData = await exercise.findOne({ userId, dayId, _id: exerciseId })
  if (!exerciseData) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NoExerciseFound,
    })
  }

  // updating exercise details
  exerciseData.exerciseDetails = exerciseDetails
    ? { ...exerciseData.exerciseDetails, ...exerciseDetails }
    : exerciseData.exerciseDetails

  // removing videos
  if (!!removedVideos && removedVideos.length > 0) {
    exerciseData.videoRecommendations = exerciseData.videoRecommendations.filter((video) => {
      return !removedVideos.includes(video.videoId)
    })
  }

  // adding new videos
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

/**
 * @function getTodayExercises
 * @description Retrieves exercises for the current day based on the user's planner start date.
 * @route GET /exercise/getTodayExercises
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user._id - User ID
 * @param {Object} res - Express response object
 * @throws {ApiError} If user is not found, no days are found, or planner start date is missing
 */
const getTodayExercises = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user

  // checking if user exists
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.NotAValidUser,
    })
  }

  // checking if user has days
  const allDays = await days.find({ userId }).sort({ createdAt: 1 })

  if (!allDays.length) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.AddDayFirst,
    })
  }

  // checking if planner start date is present
  if (!user.plannerStartDate) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.PlannerDateMissing,
    })
  }

  const plannerStartDate = moment(user.plannerStartDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ')
  const today = moment()

  const dayDifference = today.diff(plannerStartDate, 'days')

  // checking if start date is in the future
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

  if (!exercises && exercises.length === 0) {
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
