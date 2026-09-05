import TimeOffAllocation from '../models/TimeOffAllocation.js'
import TimeOffRequest from '../models/TimeOffRequest.js'
import TimeOffType from '../models/TimeOffType.js'
import Employee from '../models/Employee.js'
import { approveTimeOffRequest, validateTimeOffRequest, workflowError } from '../services/timeOff.js'

export const timeOffManagementRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

function canManage(user) {
  return timeOffManagementRoles.includes(user.role)
}

function ownEmployeeId(user) {
  return user.employeeId?._id || user.employeeId
}

async function assertEmployee(employeeId) {
  if (!(await Employee.exists({ _id: employeeId, status: 'active' }))) throw workflowError('Active employee not found', 400)
}

export async function listTypes(_request, response, next) {
  try {
    const types = await TimeOffType.find({ active: true }).sort({ name: 1 })
    return response.json({ types })
  } catch (error) { return next(error) }
}

export async function createType(request, response, next) {
  try {
    const type = await TimeOffType.create(request.body)
    return response.status(201).json({ type })
  } catch (error) { return next(error) }
}

export async function updateType(request, response, next) {
  try {
    const type = await TimeOffType.findByIdAndUpdate(request.params.typeId, request.body, { new: true, runValidators: true })
    if (!type) return response.status(404).json({ error: 'Time-off type not found' })
    return response.json({ type })
  } catch (error) { return next(error) }
}

export async function listAllocations(request, response, next) {
  try {
    const filter = canManage(request.user) ? (request.query.employeeId ? { employeeId: request.query.employeeId } : {}) : { employeeId: ownEmployeeId(request.user) }
    const allocations = await TimeOffAllocation.find(filter).populate('employeeId', 'employeeNumber firstName lastName').populate('timeOffTypeId', 'name code unit').sort({ validTo: -1 })
    const result = allocations.map((allocation) => ({ ...allocation.toObject(), remainingAmount: allocation.allocatedAmount - allocation.usedAmount }))
    return response.json({ allocations: result })
  } catch (error) { return next(error) }
}

export async function createAllocation(request, response, next) {
  try {
    await assertEmployee(request.body.employeeId)
    if (!(await TimeOffType.exists({ _id: request.body.timeOffTypeId, active: true }))) throw workflowError('Active time-off type not found', 400)
    const allocation = await TimeOffAllocation.create({ ...request.body, status: 'draft' })
    return response.status(201).json({ allocation })
  } catch (error) { return next(error) }
}

export async function approveAllocation(request, response, next) {
  try {
    const allocation = await TimeOffAllocation.findOneAndUpdate({ _id: request.params.allocationId, status: 'draft' }, { status: 'approved' }, { new: true, runValidators: true })
    if (!allocation) return response.status(409).json({ error: 'Only draft allocations can be approved' })
    return response.json({ allocation })
  } catch (error) { return next(error) }
}

export async function listRequests(request, response, next) {
  try {
    const filter = canManage(request.user) ? (request.query.employeeId ? { employeeId: request.query.employeeId } : {}) : { employeeId: ownEmployeeId(request.user) }
    if (request.query.status) filter.status = request.query.status
    const requests = await TimeOffRequest.find(filter).populate('employeeId', 'employeeNumber firstName lastName').populate('timeOffTypeId', 'name code unit').populate('allocationId').sort({ startDate: -1 })
    return response.json({ requests })
  } catch (error) { return next(error) }
}

export async function createRequest(request, response, next) {
  try {
    const employeeId = canManage(request.user) && request.body.employeeId ? request.body.employeeId : ownEmployeeId(request.user)
    await assertEmployee(employeeId)
    const validated = await validateTimeOffRequest({ ...request.body, employeeId })
    const timeOffRequest = await TimeOffRequest.create({
      employeeId,
      timeOffTypeId: request.body.timeOffTypeId,
      startDate: validated.startDate,
      endDate: validated.endDate,
      requestedAmount: validated.requestedAmount,
      reason: request.body.reason,
      status: 'submitted',
    })
    if (!validated.type.approvalRequired) {
      const approved = await approveTimeOffRequest(timeOffRequest._id, ownEmployeeId(request.user))
      return response.status(201).json({ request: approved })
    }
    return response.status(201).json({ request: timeOffRequest })
  } catch (error) { return next(error) }
}

export async function approveRequest(request, response, next) {
  try {
    const approved = await approveTimeOffRequest(request.params.requestId, ownEmployeeId(request.user))
    return response.json({ request: approved })
  } catch (error) { return next(error) }
}

export async function refuseRequest(request, response, next) {
  try {
    const refused = await TimeOffRequest.findOneAndUpdate({ _id: request.params.requestId, status: 'submitted' }, { status: 'refused', approvedBy: ownEmployeeId(request.user), approvedAt: new Date() }, { new: true })
    if (!refused) return response.status(409).json({ error: 'Only submitted requests can be refused' })
    return response.json({ request: refused })
  } catch (error) { return next(error) }
}
