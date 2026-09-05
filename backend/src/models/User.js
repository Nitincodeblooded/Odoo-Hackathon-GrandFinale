import mongoose from 'mongoose'
import { roles } from './enums.js'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: roles, default: 'employee', index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  active: { type: Boolean, default: true, index: true },
  lastLoginAt: { type: Date },
}, { timestamps: true })

userSchema.index({ role: 1, active: 1 })

export default mongoose.model('User', userSchema)
