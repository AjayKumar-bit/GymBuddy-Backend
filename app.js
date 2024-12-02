import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

//route imports
import { userRouter } from './src/routes/user.routes.js'
import { daysRouter } from './src/routes/days.routes.js'
import { exerciseRouter } from './src/routes/exercise.routes.js'

app.use('/users', userRouter)
app.use('/days', daysRouter)
app.use('/exercise', exerciseRouter)

export default app
