// TODO: file for future otp verification

import nodemailer from 'nodemailer'

import fs from 'fs'
import { asyncHandler } from './asyncHandler.utils.js'
const mailTransport = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: false,
  auth: {
    user: process.env.MAILER_USER_ID,
    pass: process.env.MAILER_TOKEN,
  },
})

const otpGenerator = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

const sendMail = async (emailId) => {
  const otp = otpGenerator()
  let htmlTemplate = fs.readFileSync('./src/public/otpTemplate.html', 'utf-8')
  htmlTemplate = htmlTemplate.replace('{{otp}}', otp)
  await mailTransport.sendMail({
    from: {
      address: process.env.SENDER_ADDRESS,
      name: process.env.SENDER_NAME,
    },
    to: emailId,
    subject: 'Otp for GymBuddy account Verification',
    html: htmlTemplate,
  })
}

export { sendMail, otpGenerator }
