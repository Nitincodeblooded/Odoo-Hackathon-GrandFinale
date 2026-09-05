import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function emailError(message, statusCode = 503) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

let transport

function getTransport() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password || !env.smtp.from) {
    throw emailError('SMTP email delivery is not configured')
  }
  if (!transport) {
    transport = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    })
  }
  return transport
}

export async function sendPayslipEmail({ to, employeeName, periodStart, periodEnd, fileName, pdf }) {
  if (!to) throw emailError(`No work email is configured for ${employeeName}`, 422)
  return getTransport().sendMail({
    from: env.smtp.from,
    to,
    subject: `Payslip: ${periodStart} to ${periodEnd}`,
    text: `Hello ${employeeName},\n\nYour payslip for ${periodStart} to ${periodEnd} is attached.\n\nPeoplePay360 Payroll`,
    attachments: [{ filename: fileName, content: pdf, contentType: 'application/pdf' }],
  })
}
