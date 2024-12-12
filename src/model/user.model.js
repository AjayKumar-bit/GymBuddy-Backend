import { mongoose, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  emailId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  accessToken: {
    type: String,
    default: '',
  },
  plannerStartDate:{
    type: Date,
    default: '',
  }
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  const isMatched = await bcrypt.compare(password, this.password)
  return isMatched
}

export const User = mongoose.model('User', userSchema)
