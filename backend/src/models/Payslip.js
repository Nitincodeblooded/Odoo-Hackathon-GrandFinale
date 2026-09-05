import mongoose from 'mongoose'
import { payslipStatuses } from './enums.js'

const payslipSchema = new mongoose.Schema({
  payrunId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payrun', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  status: { type: String, enum: payslipStatuses, default: 'draft', index: true },
  workedDays: { type: Number, default: 0, min: 0 },
  grossAmount: { type: Number, default: 0, min: 0 },
  deductionAmount: { type: Number, default: 0, min: 0 },
  netAmount: { type: Number, default: 0, min: 0 },
  employeeSnapshot: {
    employeeNumber: String,
    name: String,
    department: String,
  },
  contractSnapshot: {
    title: String,
    wage: Number,
    currency: String,
  },
}, { timestamps: true })

payslipSchema.index({ payrunId: 1, employeeId: 1 }, { unique: true })
payslipSchema.index({ employeeId: 1, periodStart: 1, periodEnd: 1 })

export default mongoose.model('Payslip', payslipSchema)
