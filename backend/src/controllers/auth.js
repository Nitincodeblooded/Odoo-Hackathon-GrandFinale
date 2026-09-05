import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Employee from '../models/Employee.js'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { roles } from '../models/enums.js'
import { serializeUser } from '../middleware/auth.js'

const passwordRounds = 12

function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
}

function requiredText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export async function register(request, response, next) {
  try {
    const { email, password, employeeNumber, firstName, lastName, department, jobPosition } = request.body

    if (![email, password, employeeNumber, firstName, lastName].every(requiredText)) {
      return response.status(400).json({ error: 'email, password, employeeNumber, firstName, and lastName are required' })
    }
    if (password.length < 8) {
      return response.status(400).json({ error: 'Password must contain at least 8 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })
    const existingEmployee = await Employee.findOne({ $or: [{ employeeNumber: employeeNumber.trim() }, { workEmail: normalizedEmail }] })
    if (existingUser || existingEmployee) {
      return response.status(409).json({ error: 'Email, employee number, or work email is already in use' })
    }

    const employee = await Employee.create({
      employeeNumber: employeeNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      workEmail: normalizedEmail,
      department,
      jobPosition,
    })

    try {
      const passwordHash = await bcrypt.hash(password, passwordRounds)
      const user = await User.create({ email: normalizedEmail, passwordHash, employeeId: employee._id, role: 'employee' })
      await Employee.updateOne({ _id: employee._id }, { userId: user._id })
      return response.status(201).json({ token: createToken(user), user: serializeUser({ ...user.toObject(), employeeId: employee }) })
    } catch (error) {
      await Employee.deleteOne({ _id: employee._id })
      throw error
    }
  } catch (error) {
    return next(error)
  }
}

export async function login(request, response, next) {
  try {
    const { email, password } = request.body
    if (!requiredText(email) || !requiredText(password)) {
      return response.status(400).json({ error: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase(), active: true }).select('+passwordHash').populate('employeeId')
    const validPassword = user && await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return response.status(401).json({ error: 'Invalid email or password' })
    }

    user.lastLoginAt = new Date()
    await user.save()
    return response.json({ token: createToken(user), user: serializeUser(user) })
  } catch (error) {
    return next(error)
  }
}

export function currentUser(request, response) {
  return response.json({ user: serializeUser(request.user) })
}

export async function updateRole(request, response, next) {
  try {
    const { role } = request.body
    if (!roles.includes(role)) return response.status(400).json({ error: 'Invalid role' })
    if (request.user._id.toString() === request.params.userId && role !== 'admin') {
      return response.status(400).json({ error: 'An admin cannot remove their own admin access' })
    }

    const user = await User.findByIdAndUpdate(request.params.userId, { role }, { new: true, runValidators: true }).populate('employeeId')
    if (!user) return response.status(404).json({ error: 'User not found' })
    return response.json({ user: serializeUser(user) })
  } catch (error) {
    return next(error)
  }
}
