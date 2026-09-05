import mongoose from 'mongoose'
import { payrunStatuses } from './enums.js'

const payrunSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  status: { type: String, enum: payrunStatuses, default: 'draft', index: true },
  employeeCount: { type: Number, default: 0, min: 0 },
  totalGross: { type: Number, default: 0, min: 0 },
  totalNet: { type: Number, default: 0, min: 0 },
  warnings: [{ type: String, trim: true }],
}, { timestamps: true })

payrunSchema.index({ periodStart: 1, periodEnd: 1, status: 1 })
payrunSchema.pre('validate', function validateDates(next) {
  if (this.periodEnd < this.periodStart) this.invalidate('periodEnd', 'Period end cannot precede period start')
  next()
})

export default mongoose.model('Payrun', payrunSchema)
