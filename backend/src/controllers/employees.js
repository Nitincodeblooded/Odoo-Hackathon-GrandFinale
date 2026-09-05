import Employee from '../models/Employee.js'
import User from '../models/User.js'
import Attendance from '../models/Attendance.js'
import Contract from '../models/Contract.js'
import TimeOffAllocation from '../models/TimeOffAllocation.js'
import TimeOffRequest from '../models/TimeOffRequest.js'
import WorkingSchedule from '../models/WorkingSchedule.js'

export const employeeManagementRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

const editableFields = [
  'employeeNumber',
  'firstName',
  'lastName',
  'workEmail',
  'department',
  'jobPosition',
  'managerId',
  'workingScheduleId',
  'employeeType',
  'status',
  'hireDate',
  'terminationDate',
]

function hasManagementAccess(user) {
  return employeeManagementRoles.includes(user.role)
}

function pickEmployeeFields(body) {
  return Object.fromEntries(editableFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]))
}

async function validateRelationships(data, employeeId) {
  if (data.managerId && data.managerId.toString() === employeeId?.toString()) {
    const error = new Error('An employee cannot be their own manager')
    error.statusCode = 400
    throw error
  }
  if (data.managerId && !(await Employee.exists({ _id: data.managerId, status: { $ne: 'terminated' } }))) {
    const error = new Error('Manager employee not found')
    error.statusCode = 400
    throw error
  }
  if (data.workingScheduleId && !(await WorkingSchedule.exists({ _id: data.workingScheduleId, active: true }))) {
    const error = new Error('Active working schedule not found')
    error.statusCode = 400
    throw error
  }
}

async function withRelatedCounts(employee) {
  const [contracts, attendance, timeOffRequests, allocations] = await Promise.all([
    Contract.countDocuments({ employeeId: employee._id }),
    Attendance.countDocuments({ employeeId: employee._id }),
    TimeOffRequest.countDocuments({ employeeId: employee._id }),
    TimeOffAllocation.countDocuments({ employeeId: employee._id }),
  ])
  return { ...employee.toObject(), relatedCounts: { contracts, attendance, timeOffRequests, allocations } }
}

export async function listEmployees(request, response, next) {
  try {
    const filter = hasManagementAccess(request.user) ? {} : { _id: request.user.employeeId._id }
    const employees = await Employee.find(filter).populate('managerId', 'employeeNumber firstName lastName').populate('workingScheduleId', 'name weeklyHours').sort({ lastName: 1, firstName: 1 })
    return response.json({ employees })
  } catch (error) {
    return next(error)
  }
}

export async function getEmployee(request, response, next) {
  try {
    const employee = await Employee.findById(request.params.employeeId).populate('managerId', 'employeeNumber firstName lastName').populate('workingScheduleId', 'name weeklyHours')
    if (!employee) return response.status(404).json({ error: 'Employee not found' })
    if (!hasManagementAccess(request.user) && employee._id.toString() !== request.user.employeeId._id.toString()) {
      return response.status(403).json({ error: 'You can only access your own employee record' })
    }
    return response.json({ employee: await withRelatedCounts(employee) })
  } catch (error) {
    return next(error)
  }
}

export async function createEmployee(request, response, next) {
  try {
    const data = pickEmployeeFields(request.body)
    await validateRelationships(data)
    const employee = await Employee.create(data)
    return response.status(201).json({ employee })
  } catch (error) {
    return next(error)
  }
}

export async function updateEmployee(request, response, next) {
  try {
    const employee = await Employee.findById(request.params.employeeId)
    if (!employee) return response.status(404).json({ error: 'Employee not found' })
    const data = pickEmployeeFields(request.body)
    await validateRelationships(data, employee._id)
    Object.assign(employee, data)
    await employee.save()
    const updatedEmployee = await Employee.findById(employee._id).populate('managerId', 'employeeNumber firstName lastName').populate('workingScheduleId', 'name weeklyHours')
    return response.json({ employee: updatedEmployee })
  } catch (error) {
    return next(error)
  }
}

export async function deactivateEmployee(request, response, next) {
  try {
    const employee = await Employee.findById(request.params.employeeId)
    if (!employee) return response.status(404).json({ error: 'Employee not found' })
    if (employee.status === 'terminated') return response.status(409).json({ error: 'Employee is already deactivated' })

    employee.status = 'terminated'
    employee.terminationDate = new Date()
    await employee.save()
    await User.updateOne({ employeeId: employee._id }, { active: false })
    return response.json({ employee })
  } catch (error) {
    return next(error)
  }
}
