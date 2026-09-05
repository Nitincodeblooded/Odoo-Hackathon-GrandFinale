import mongoose from 'mongoose'
import { timeOffRequestStatuses } from './enums.js'

const timeOffRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  timeOffTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeOffType', required: true },
  allocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeOffAllocation' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  requestedAmount: { type: Number, required: true, min: 0 },
  reason: { type: String, trim: true },
  status: { type: String, enum: timeOffRequestStatuses, default: 'draft', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt: { type: Date },
}, { timestamps: true })

timeOffRequestSchema.index({ employeeId: 1, status: 1 })
timeOffRequestSchema.pre('validate', function validateDates(next) {
  if (this.endDate < this.startDate) this.invalidate('endDate', 'End date cannot precede start date')
  next()
})

export default mongoose.model('TimeOffRequest', timeOffRequestSchema)
