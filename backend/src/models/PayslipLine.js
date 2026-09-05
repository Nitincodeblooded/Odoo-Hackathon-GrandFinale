import mongoose from 'mongoose'
import { salaryRuleCategories } from './enums.js'

const payslipLineSchema = new mongoose.Schema({
  payslipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payslip', required: true },
  salaryRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryRule', required: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: salaryRuleCategories, required: true },
  sequence: { type: Number, required: true, min: 1 },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, default: 100, min: 0 },
  amount: { type: Number, required: true },
}, { timestamps: true })

payslipLineSchema.index({ payslipId: 1, code: 1 }, { unique: true })
payslipLineSchema.index({ payslipId: 1, sequence: 1 })

export default mongoose.model('PayslipLine', payslipLineSchema)
