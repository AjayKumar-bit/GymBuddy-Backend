import { Router } from 'express'
import {
  deleteUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from '../controllers/user.controllers.js'
import { verifyToken } from '../middleware/auth.middlewarre.js'

const router = Router()
router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyToken, logoutUser)
router.route('/updateProfile').post(verifyToken, updateUser)
router.route('/deleteUser').post(verifyToken, deleteUser)

export const userRouter = router
