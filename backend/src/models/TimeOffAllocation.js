import mongoose from 'mongoose'
import { allocationStatuses } from './enums.js'

const timeOffAllocationSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  timeOffTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeOffType', required: true },
  allocatedAmount: { type: Number, required: true, min: 0 },
  usedAmount: { type: Number, default: 0, min: 0 },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  status: { type: String, enum: allocationStatuses, default: 'draft', index: true },
}, { timestamps: true })

timeOffAllocationSchema.index({ employeeId: 1, timeOffTypeId: 1, status: 1 })
timeOffAllocationSchema.pre('validate', function validateDates(next) {
  if (this.validTo < this.validFrom) this.invalidate('validTo', 'Validity end cannot precede start')
  if (this.usedAmount > this.allocatedAmount) this.invalidate('usedAmount', 'Used amount cannot exceed allocation')
  next()
})

export default mongoose.model('TimeOffAllocation', timeOffAllocationSchema)
