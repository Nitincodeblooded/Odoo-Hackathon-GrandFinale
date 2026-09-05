import mongoose from 'mongoose'
import { contractStatuses } from './enums.js'

const contractSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  title: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  position: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  wage: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', uppercase: true, trim: true },
  salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure', required: true },
  workingScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkingSchedule' },
  status: { type: String, enum: contractStatuses, default: 'draft', index: true },
}, { timestamps: true })

contractSchema.index({ employeeId: 1, startDate: 1, endDate: 1 })

contractSchema.pre('validate', function validateDates(next) {
  if (this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'Contract end date cannot precede start date')
  }
  next()
})

export default mongoose.model('Contract', contractSchema)
