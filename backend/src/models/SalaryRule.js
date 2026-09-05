import mongoose from 'mongoose'
import { salaryRuleAmountTypes, salaryRuleCategories } from './enums.js'

const salaryRuleSchema = new mongoose.Schema({
  salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure', required: true, index: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  category: { type: String, enum: salaryRuleCategories, required: true },
  sequence: { type: Number, required: true, min: 1 },
  amountType: { type: String, enum: salaryRuleAmountTypes, required: true },
  amount: { type: Number, min: 0 },
  percentage: { type: Number, min: 0, max: 100 },
  formula: { type: String, trim: true },
  dependsOn: [{ type: String, uppercase: true, trim: true }],
  active: { type: Boolean, default: true },
}, { timestamps: true })

salaryRuleSchema.index({ salaryStructureId: 1, code: 1 }, { unique: true })
salaryRuleSchema.index({ salaryStructureId: 1, sequence: 1 })

salaryRuleSchema.pre('validate', function validateAmountConfiguration(next) {
  if (this.amountType === 'fixed' && this.amount === undefined) this.invalidate('amount', 'Fixed rules require an amount')
  if (this.amountType === 'percentage' && this.percentage === undefined) this.invalidate('percentage', 'Percentage rules require a percentage')
  if (this.amountType === 'formula' && !this.formula) this.invalidate('formula', 'Formula rules require a formula')
  next()
})

export default mongoose.model('SalaryRule', salaryRuleSchema)
