import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'
import Payrun from '../models/Payrun.js'
import Payslip from '../models/Payslip.js'
import TimeOffRequest from '../models/TimeOffRequest.js'
import { findApplicableContract } from './contracts.js'

function dashboardError(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

function parseDate(value, fallback) {
  const date = value ? new Date(value) : fallback
  if (Number.isNaN(date.valueOf())) throw dashboardError('Dashboard dates must be valid')
  return date
}

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export async function buildDashboard(filters = {}) {
  const periodEnd = parseDate(filters.periodEnd, new Date())
  const defaultStart = new Date(periodEnd)
  defaultStart.setUTCFullYear(defaultStart.getUTCFullYear() - 1)
  const periodStart = parseDate(filters.periodStart, defaultStart)
  if (periodEnd < periodStart) throw dashboardError('Dashboard period end cannot precede its start')

  const employeeFilter = { status: { $ne: 'terminated' } }
  if (filters.department) employeeFilter.department = filters.department
  if (filters.employeeType) employeeFilter.employeeType = filters.employeeType
  const employees = await Employee.find(employeeFilter).select('+bankAccountNumber').lean()
  const employeeIds = employees.map((employee) => employee._id)
  const employeeById = new Map(employees.map((employee) => [employee._id.toString(), employee]))

  const payslipFilter = { employeeId: { $in: employeeIds }, periodStart: { $gte: periodStart, $lte: periodEnd }, status: 'paid' }
  const [paidPayslips, approvedLeave, attendance, payruns] = await Promise.all([
    Payslip.find(payslipFilter).lean(),
    TimeOffRequest.find({ employeeId: { $in: employeeIds }, status: 'approved', startDate: { $lte: periodEnd }, endDate: { $gte: periodStart } }).populate('timeOffTypeId', 'unit').lean(),
    Attendance.find({ employeeId: { $in: employeeIds }, workDate: { $gte: periodStart, $lte: periodEnd } }).lean(),
    Payrun.find({ periodStart: { $lte: periodEnd }, periodEnd: { $gte: periodStart } }).sort({ createdAt: -1 }).lean(),
  ])

  const totalNetSalaryPaid = round(paidPayslips.reduce((total, payslip) => total + payslip.netAmount, 0))
  const averageSalary = paidPayslips.length ? round(totalNetSalaryPaid / paidPayslips.length) : 0
  const presentStatuses = new Set(['present', 'late', 'overtime', 'corrected'])
  const healthyAttendance = attendance.filter((entry) => presentStatuses.has(entry.status)).length
  const attendanceHealth = attendance.length ? round((healthyAttendance / attendance.length) * 100) : 0
  const approvedTimeOff = round(approvedLeave.reduce((total, request) => total + request.requestedAmount, 0))

  const departmentMap = new Map()
  for (const payslip of paidPayslips) {
    const department = payslip.employeeSnapshot?.department || employeeById.get(payslip.employeeId.toString())?.department || 'Unassigned'
    departmentMap.set(department, (departmentMap.get(department) || 0) + payslip.netAmount)
  }
  const salaryByDepartment = [...departmentMap.entries()].map(([department, amount]) => ({ department, amount: round(amount) })).sort((left, right) => right.amount - left.amount)

  const monthlyMap = new Map()
  for (const payslip of paidPayslips) {
    const month = new Date(payslip.periodStart).toISOString().slice(0, 7)
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + payslip.netAmount)
  }
  const monthlyNetSalary = [...monthlyMap.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([month, amount]) => ({ month, amount: round(amount) }))

  const alerts = []
  for (const employee of employees) {
    const missing = []
    if (!employee.workEmail) missing.push('work email')
    if (!employee.department) missing.push('department')
    if (!employee.jobPosition) missing.push('job position')
    if (!employee.bankName || !employee.bankAccountNumber) missing.push('bank information')
    if (missing.length) alerts.push({ type: 'missing_information', severity: 'warning', employeeId: employee._id, message: `${employee.firstName} ${employee.lastName}: missing ${missing.join(', ')}` })
  }

  for (const payrun of payruns) {
    for (const warning of payrun.warnings || []) alerts.push({ type: 'payroll_warning', severity: 'warning', payrunId: payrun._id, message: warning })
    alerts.push({ type: 'payroll_status', severity: payrun.status === 'paid' ? 'info' : 'warning', payrunId: payrun._id, message: `${payrun.code} is ${payrun.status}` })
  }

  const duplicateGroups = await Payslip.aggregate([
    { $match: { employeeId: { $in: employeeIds }, periodStart: { $gte: periodStart, $lte: periodEnd } } },
    { $group: { _id: { employeeId: '$employeeId', periodStart: '$periodStart', periodEnd: '$periodEnd' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ])
  for (const duplicate of duplicateGroups) alerts.push({ type: 'duplicate_payslip', severity: 'error', employeeId: duplicate._id.employeeId, message: `Duplicate payslips found for ${duplicate._id.periodStart.toISOString().slice(0, 10)}` })

  const contractIssues = []
  for (const employee of employees) {
    try {
      await findApplicableContract(employee._id, periodStart, periodEnd)
    } catch (error) {
      contractIssues.push({ type: 'contract_issue', severity: 'error', employeeId: employee._id, message: `${employee.firstName} ${employee.lastName}: ${error.message}` })
    }
  }
  alerts.push(...contractIssues)

  return {
    filters: { periodStart, periodEnd, department: filters.department || null, employeeType: filters.employeeType || null },
    kpis: {
      totalNetSalaryPaid,
      payslipsGenerated: paidPayslips.length,
      averageSalary,
      approvedTimeOff,
      attendanceHealth,
    },
    charts: { salaryByDepartment, monthlyNetSalary },
    alerts,
    metadata: { employeeCount: employees.length, attendanceRecords: attendance.length, approvedLeaveRequests: approvedLeave.length },
  }
}
