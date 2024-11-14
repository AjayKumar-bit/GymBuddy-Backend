const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    res.status(error.statusCode || 500).json({
      massage: error.message,
      statusCode: error.statusCode,
      success: false,
    })
  }
}

export { asyncHandler }
