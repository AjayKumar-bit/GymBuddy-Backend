import { Router } from 'express'

import { verifyToken } from '../middleware/auth.middleware.js'
import {
  addExercise,
  deleteExercise,
  getExercisesByDay,
  getTodayExercises,
  updateExercise,
} from '../controllers/exercise.controllers.js'

const router = Router()
router.route('/addExercise').post(verifyToken, addExercise)
router.route('/exercises/:dayId').get(verifyToken, getExercisesByDay)
router.route('/deleteExercise').delete(verifyToken, deleteExercise)
router.route('/updateExercise').patch(verifyToken, updateExercise)
router.route('/getTodayExercises').get(verifyToken, getTodayExercises)

export const exerciseRouter = router
