import { mongoose, Schema } from 'mongoose'

const daySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
)

daySchema.index({ userId: 1, dayName: 1 }) // Compound index on userId and dayName

export const days = mongoose.model('Days', daySchema)
