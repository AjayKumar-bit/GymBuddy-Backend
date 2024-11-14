import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())
app.use(express.json())

//route imports
import { userRouter } from './src/routes/user.routes.js'

app.use('/users', userRouter)
export default app
