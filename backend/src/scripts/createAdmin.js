import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import Employee from '../models/Employee.js'
import User from '../models/User.js'

const required = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_EMPLOYEE_NUMBER', 'ADMIN_FIRST_NAME', 'ADMIN_LAST_NAME']
const missing = required.filter((name) => !process.env[name])

if (missing.length > 0) {
  throw new Error(`Missing admin seed variables: ${missing.join(', ')}`)
}
if (process.env.ADMIN_PASSWORD.length < 8) {
  throw new Error('ADMIN_PASSWORD must contain at least 8 characters')
}

const connected = await connectDatabase(env.mongodbUri)
if (!connected) throw new Error('MongoDB connection is required to seed an admin')

const email = process.env.ADMIN_EMAIL.trim().toLowerCase()
const existing = await User.findOne({ email })
if (existing) throw new Error('An account with ADMIN_EMAIL already exists')

const employee = await Employee.create({
  employeeNumber: process.env.ADMIN_EMPLOYEE_NUMBER.trim(),
  firstName: process.env.ADMIN_FIRST_NAME.trim(),
  lastName: process.env.ADMIN_LAST_NAME.trim(),
  workEmail: email,
})

try {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
  await User.create({ email, passwordHash, role: 'admin', employeeId: employee._id })
  console.log(`Admin account created for ${email}`)
} catch (error) {
  await Employee.deleteOne({ _id: employee._id })
  throw error
} finally {
  await mongoose.disconnect()
}
