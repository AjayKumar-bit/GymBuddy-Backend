import jwt from 'jsonwebtoken'

const isValidEmail = (email) => {
  const emailRegex =
    /^[a-zA-Z0-9]+([._-][0-9a-zA-Z]+)*@[a-zA-Z0-9]+([.-][0-9a-zA-Z]+)*\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

const generateToken = (id) => {
  return jwt.sign({ _id: id }, process.env.JWT_KEY)
}

export { isValidEmail, generateToken }
