import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { User } from '../model/user.model.js'
import { ApiError } from '../utils/apiError.utils.js'
import { ApiErrorMessages, ApiStatusCode } from '../constants/api.constants.js'

const verifyToken = asyncHandler(async (req, _, next) => {
  const accessToken = req.header('Authorization').replace('Bearer ', '')
  let id

  // if token not present
  if (!accessToken) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidToken,
    })
  }

  //validating token
  try {
    id = jwt.verify(accessToken, process.env.JWT_KEY)
  } catch (error) {
    throw new ApiError({
      statusCode: ApiStatusCode.BadRequest,
      message: ApiErrorMessages.InvalidToken,
    })
  }

  const user = await User.findOne({ _id: id }).select('-password')

  // if user not exist
  if (!user) {
    throw new ApiError({
      statusCode: ApiStatusCode.NotFound,
      message: ApiErrorMessages.UserNotFound,
    })
  }

  req.user = user
  next()
})

export { verifyToken }
