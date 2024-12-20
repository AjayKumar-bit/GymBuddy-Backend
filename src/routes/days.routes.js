import { Router } from 'express'

import { verifyToken } from '../middleware/auth.middleware.js'
import { addDay, deleteDay, getDays, updateDay } from '../controllers/days.controllers.js'

const router = Router()
router.route('/addDay').post(verifyToken, addDay)
router.route('/getDays').get(verifyToken, getDays)
router.route('/updateDay').patch(verifyToken, updateDay)
router.route('/deleteDay').delete(verifyToken, deleteDay)

export const daysRouter = router
