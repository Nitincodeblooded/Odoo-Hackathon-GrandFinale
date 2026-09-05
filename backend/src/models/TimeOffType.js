import mongoose from 'mongoose'

const timeOffTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true, unique: true },
  unit: { type: String, enum: ['days', 'hours'], default: 'days' },
  requiresAllocation: { type: Boolean, default: true },
  approvalRequired: { type: Boolean, default: true },
  payrollIntegration: { type: Boolean, default: false },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('TimeOffType', timeOffTypeSchema)
