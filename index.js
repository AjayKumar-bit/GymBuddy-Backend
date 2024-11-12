import dotenv from 'dotenv'
import { connectDB } from './src/database/index.js'
import app from './app.js'
dotenv.config({ path: './env' })

const port = process.env.PORT || 8000

try {
  await connectDB()
  app.on('error', (error) => {
    console.log('Error in connecting DB and Server', error)
  })
  app.listen(port, () => {
    console.log('server started at port number :', port)
  })
} catch (error) {
  console.log('Error while staring server:', error)
}
