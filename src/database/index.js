import mongoose from 'mongoose'
import { DB_NAME } from '../constants/db.constants.js'

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
    console.log(`\n DataBase connected ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log('Error while connecting DB :', error)
  }
}
