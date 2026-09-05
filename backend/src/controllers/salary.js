import SalaryRule from '../models/SalaryRule.js'
import SalaryStructure from '../models/SalaryStructure.js'
import { calculateSalaryRules } from '../services/salaryRules.js'

export const salaryReadRoles = ['hr_payroll_user', 'hr_payroll_manager', 'admin']
export const salaryWriteRoles = ['hr_payroll_manager', 'admin']

export async function listStructures(_request, response, next) {
  try {
    const structures = await SalaryStructure.find().sort({ name: 1 })
    const withCounts = await Promise.all(structures.map(async (structure) => ({
      ...structure.toObject(),
      ruleCount: await SalaryRule.countDocuments({ salaryStructureId: structure._id, active: true }),
    })))
    return response.json({ structures: withCounts })
  } catch (error) { return next(error) }
}

export async function getStructure(request, response, next) {
  try {
    const structure = await SalaryStructure.findById(request.params.structureId)
    if (!structure) return response.status(404).json({ error: 'Salary structure not found' })
    const rules = await SalaryRule.find({ salaryStructureId: structure._id, active: true }).sort({ sequence: 1 })
    return response.json({ structure, rules })
  } catch (error) { return next(error) }
}

export async function createStructure(request, response, next) {
  try {
    const structure = await SalaryStructure.create(request.body)
    return response.status(201).json({ structure })
  } catch (error) { return next(error) }
}

export async function updateStructure(request, response, next) {
  try {
    const structure = await SalaryStructure.findByIdAndUpdate(request.params.structureId, request.body, { new: true, runValidators: true })
    if (!structure) return response.status(404).json({ error: 'Salary structure not found' })
    return response.json({ structure })
  } catch (error) { return next(error) }
}

export async function listRules(request, response, next) {
  try {
    const rules = await SalaryRule.find({ salaryStructureId: request.params.structureId }).sort({ sequence: 1 })
    return response.json({ rules })
  } catch (error) { return next(error) }
}

export async function createRule(request, response, next) {
  try {
    const structure = await SalaryStructure.findOne({ _id: request.params.structureId, active: true })
    if (!structure) return response.status(404).json({ error: 'Active salary structure not found' })
    const rule = await SalaryRule.create({ ...request.body, salaryStructureId: structure._id })
    return response.status(201).json({ rule })
  } catch (error) { return next(error) }
}

export async function updateRule(request, response, next) {
  try {
    const rule = await SalaryRule.findOneAndUpdate({ _id: request.params.ruleId, salaryStructureId: request.params.structureId }, request.body, { new: true, runValidators: true })
    if (!rule) return response.status(404).json({ error: 'Salary rule not found' })
    return response.json({ rule })
  } catch (error) { return next(error) }
}

export async function deactivateRule(request, response, next) {
  try {
    const rule = await SalaryRule.findOneAndUpdate({ _id: request.params.ruleId, salaryStructureId: request.params.structureId }, { active: false }, { new: true })
    if (!rule) return response.status(404).json({ error: 'Salary rule not found' })
    return response.json({ rule })
  } catch (error) { return next(error) }
}

export async function calculateStructure(request, response, next) {
  try {
    const structure = await SalaryStructure.findOne({ _id: request.params.structureId, active: true })
    if (!structure) return response.status(404).json({ error: 'Active salary structure not found' })
    const rules = await SalaryRule.find({ salaryStructureId: structure._id, active: true }).sort({ sequence: 1 }).lean()
    const calculation = calculateSalaryRules(rules, request.body.inputs || {})
    return response.json({ structure: { id: structure._id, name: structure.name, code: structure.code }, calculation })
  } catch (error) { return next(error) }
}
