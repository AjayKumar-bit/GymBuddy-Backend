import { Router } from 'express'
import {
  addPlannerDate,
  changePassword,
  deleteUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from '../controllers/user.controllers.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()
router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyToken, logoutUser)
router.route('/updateProfile').patch(verifyToken, updateUser)
router.route('/deleteUser').delete(verifyToken, deleteUser)
router.route('/addPlannerDate').post(verifyToken, addPlannerDate)
router.route('/changePassword').patch(verifyToken, changePassword)

export const userRouter = router
