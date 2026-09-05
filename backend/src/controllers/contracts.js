import Contract from '../models/Contract.js'
import Employee from '../models/Employee.js'
import SalaryStructure from '../models/SalaryStructure.js'
import WorkingSchedule from '../models/WorkingSchedule.js'
import { assertNoOverlappingActiveContract, findApplicableContract, validatePeriod } from '../services/contracts.js'

export const contractManagementRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

function canManageContracts(user) {
  return contractManagementRoles.includes(user.role)
}

function resolveEmployeeFilter(request) {
  if (canManageContracts(request.user)) return request.query.employeeId ? { employeeId: request.query.employeeId } : {}
  return { employeeId: request.user.employeeId._id }
}

const contractFields = ['employeeId', 'title', 'department', 'position', 'startDate', 'endDate', 'wage', 'currency', 'salaryStructureId', 'workingScheduleId', 'status']

function pickContractFields(body) {
  return Object.fromEntries(contractFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]))
}

async function validateReferences(data) {
  if (!(await Employee.exists({ _id: data.employeeId, status: { $ne: 'terminated' } }))) {
    const error = new Error('Active employee not found')
    error.statusCode = 400
    throw error
  }
  if (!(await SalaryStructure.exists({ _id: data.salaryStructureId, active: true }))) {
    const error = new Error('Active salary structure not found')
    error.statusCode = 400
    throw error
  }
  if (data.workingScheduleId && !(await WorkingSchedule.exists({ _id: data.workingScheduleId, active: true }))) {
    const error = new Error('Active working schedule not found')
    error.statusCode = 400
    throw error
  }
}

export async function listContracts(request, response, next) {
  try {
    const filter = resolveEmployeeFilter(request)
    const contracts = await Contract.find(filter).populate('employeeId', 'employeeNumber firstName lastName').populate('salaryStructureId', 'name code').populate('workingScheduleId', 'name weeklyHours').sort({ startDate: -1 })
    return response.json({ contracts })
  } catch (error) {
    return next(error)
  }
}

export async function getContract(request, response, next) {
  try {
    const contract = await Contract.findById(request.params.contractId).populate('employeeId', 'employeeNumber firstName lastName').populate('salaryStructureId', 'name code').populate('workingScheduleId', 'name weeklyHours')
    if (!contract) return response.status(404).json({ error: 'Contract not found' })
    if (!canManageContracts(request.user) && contract.employeeId._id.toString() !== request.user.employeeId._id.toString()) {
      return response.status(403).json({ error: 'You can only access your own contracts' })
    }
    return response.json({ contract })
  } catch (error) {
    return next(error)
  }
}

export async function createContract(request, response, next) {
  try {
    const data = pickContractFields(request.body)
    await validateReferences(data)
    const { start, end } = validatePeriod(data.startDate, data.endDate || '9999-12-31')
    if (data.status === 'active') await assertNoOverlappingActiveContract(data.employeeId, start, data.endDate ? end : null)
    const contract = await Contract.create(data)
    return response.status(201).json({ contract })
  } catch (error) {
    return next(error)
  }
}

export async function updateContract(request, response, next) {
  try {
    const contract = await Contract.findById(request.params.contractId)
    if (!contract) return response.status(404).json({ error: 'Contract not found' })
    const data = pickContractFields(request.body)
    const merged = { ...contract.toObject(), ...data }
    await validateReferences(merged)
    const { start, end } = validatePeriod(merged.startDate, merged.endDate || '9999-12-31')
    if (merged.status === 'active') await assertNoOverlappingActiveContract(merged.employeeId, start, merged.endDate ? end : null, contract._id)
    Object.assign(contract, data)
    await contract.save()
    return response.json({ contract })
  } catch (error) {
    return next(error)
  }
}

export async function getApplicableContract(request, response, next) {
  try {
    const employeeId = canManageContracts(request.user) ? request.query.employeeId : request.user.employeeId._id
    const contract = await findApplicableContract(employeeId, request.query.periodStart, request.query.periodEnd)
    return response.json({ contract })
  } catch (error) {
    return next(error)
  }
}
