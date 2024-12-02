import { mongoose, Schema } from 'mongoose'

const exerciseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayId: {
      type: Schema.Types.ObjectId,
      ref: 'Days',
      required: true,
    },
    exerciseDetails: {
      reps: {
        type: Number,
        default: 1,
        min: 1,
      },
      sets: {
        type: Number,
        default: 1,
        min: 1,
      },
      bodyPart: {
        type: String,
        trim: true,
        default: null,
      },
      equipment: {
        type: String,
        default: null,
        trim: true,
      },
      gifUrl: {
        type: String,
        default: null,
        trim: true,
      },
      id: {
        type: String,
        default: null,
        trim: true,
      },
      name: {
        type: String,
        default: null,
        trim: true,
      },
      target: {
        type: String,
        default: null,
        trim: true,
      },
      instructions: {
        type: [String],
        default: [],
      },
    },
    videoRecommendations: [
      {
        videoId: {
          type: String,
          default: null,
          trim: true,
        },
        title: {
          type: String,
          default: null,
          trim: true,
        },
        thumbnail: {
          type: String,
          default: null,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const exercise = mongoose.model('Exercise', exerciseSchema)
