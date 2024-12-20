// TODO: file for future otp verification

import { mongoose, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const tokenSchema = new Schema({
  userId: {
    type: mongoose.Schema.type.objectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3000000,
  },
})

tokenSchema.pre('save', async function (next) {
  if (this.isModified('token')) {
    this.token = await bcrypt.hash(this.token)
  }
  next()
})

tokenSchema.methods.isPasswordCorrect = async function (token) {
  return await bcrypt.compare(token, this.token)
}

export const Token = mongoose.model('Token', tokenSchema)
