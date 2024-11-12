export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    res.status(error.code).json({
      success: false,
      massage: error.massage,
    })
  }
}
