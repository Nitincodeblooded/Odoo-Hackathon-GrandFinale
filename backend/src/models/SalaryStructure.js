import mongoose from 'mongoose'

const salaryStructureSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true, unique: true },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('SalaryStructure', salaryStructureSchema)
