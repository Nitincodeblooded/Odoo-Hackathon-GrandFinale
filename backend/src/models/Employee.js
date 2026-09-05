import mongoose from 'mongoose'
import { employeeStatuses } from './enums.js'

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  employeeNumber: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  workEmail: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
  department: { type: String, trim: true },
  jobPosition: { type: String, trim: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  workingScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkingSchedule' },
  employeeType: { type: String, enum: ['full_time', 'part_time', 'contractor', 'intern'], default: 'full_time' },
  status: { type: String, enum: employeeStatuses, default: 'active', index: true },
  hireDate: { type: Date },
  terminationDate: { type: Date },
}, { timestamps: true })

employeeSchema.index({ department: 1, status: 1 })

export default mongoose.model('Employee', employeeSchema)
