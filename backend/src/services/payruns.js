import mongoose from 'mongoose'
import Attendance from '../models/Attendance.js'
import Contract from '../models/Contract.js'
import Employee from '../models/Employee.js'
import Payrun from '../models/Payrun.js'
import Payslip from '../models/Payslip.js'
import PayslipLine from '../models/PayslipLine.js'
import SalaryRule from '../models/SalaryRule.js'
import SalaryStructure from '../models/SalaryStructure.js'
import { calculateSalaryRules } from './salaryRules.js'
import { findApplicableContract, validatePeriod } from './contracts.js'

function payrunError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function uniqueIds(ids = []) {
  return [...new Set(ids.map((id) => id.toString()))]
}

export async function getEligibleEmployees(salaryStructureId, periodStart, periodEnd) {
  const { start, end } = validatePeriod(periodStart, periodEnd)
  if (!(await SalaryStructure.exists({ _id: salaryStructureId, active: true }))) throw payrunError('Active salary structure not found', 404)

  const employees = await Employee.find({ status: 'active' }).sort({ lastName: 1, firstName: 1 })
  const eligible = []
  const ineligible = []
  for (const employee of employees) {
    try {
      const contract = await findApplicableContract(employee._id, start, end)
      const duplicatePayslip = await Payslip.exists({ employeeId: employee._id, periodStart: start, periodEnd: end })
      if (duplicatePayslip) {
        ineligible.push({ employee, reason: 'A payslip already exists for this period' })
      } else {
        eligible.push({ employee, contract })
      }
    } catch (error) {
      ineligible.push({ employee, reason: error.message })
    }
  }
  return { eligible, ineligible, periodStart: start, periodEnd: end }
}

export async function createPayrun(data) {
  const employeeIds = uniqueIds(data.employeeIds)
  if (employeeIds.length === 0) throw payrunError('Select at least one employee before creating a payrun')
  const eligibility = await getEligibleEmployees(data.salaryStructureId, data.periodStart, data.periodEnd)
  const eligibleIds = new Set(eligibility.eligible.map(({ employee }) => employee._id.toString()))
  const invalidSelection = employeeIds.filter((id) => !eligibleIds.has(id))
  if (invalidSelection.length) throw payrunError('One or more selected employees are not eligible for this period', 422)

  return Payrun.create({
    code: data.code,
    name: data.name,
    salaryStructureId: data.salaryStructureId,
    periodStart: eligibility.periodStart,
    periodEnd: eligibility.periodEnd,
    employeeIds,
    employeeCount: employeeIds.length,
    status: 'draft',
  })
}

export async function computePayrun(payrunId) {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      const payrun = await Payrun.findOne({ _id: payrunId, status: 'draft' }).session(session)
      if (!payrun) throw payrunError('Only draft payruns can be computed', 409)
      payrun.status = 'computing'
      await payrun.save({ session })

      const rules = await SalaryRule.find({ salaryStructureId: payrun.salaryStructureId, active: true }).sort({ sequence: 1 }).lean().session(session)
      if (!rules.length) throw payrunError('Salary structure has no active salary rules', 422)
      const employees = await Employee.find({ _id: { $in: payrun.employeeIds }, status: 'active' }).session(session)
      const warnings = []
      let totalGross = 0
      let totalNet = 0
      let createdCount = 0

      for (const employee of employees) {
        try {
          const contract = await findApplicableContract(employee._id, payrun.periodStart, payrun.periodEnd, session)
          const workedDays = await Attendance.countDocuments({ employeeId: employee._id, workDate: { $gte: payrun.periodStart, $lte: payrun.periodEnd }, status: { $in: ['present', 'late', 'overtime', 'corrected'] } }).session(session)
          const calculation = calculateSalaryRules(rules, { BASIC: contract.wage, WORKED_DAYS: workedDays })
          const payslip = await Payslip.findOneAndUpdate(
            { payrunId: payrun._id, employeeId: employee._id },
            {
              payrunId: payrun._id,
              employeeId: employee._id,
              contractId: contract._id,
              salaryStructureId: payrun.salaryStructureId,
              periodStart: payrun.periodStart,
              periodEnd: payrun.periodEnd,
              status: 'computed',
              workedDays,
              grossAmount: calculation.grossAmount,
              deductionAmount: calculation.deductionAmount,
              netAmount: calculation.netAmount,
              employeeSnapshot: { employeeNumber: employee.employeeNumber, name: `${employee.firstName} ${employee.lastName}`, department: employee.department },
              contractSnapshot: { title: contract.title, wage: contract.wage, currency: contract.currency },
            },
            { new: true, upsert: true, runValidators: true, session },
          )
          await PayslipLine.deleteMany({ payslipId: payslip._id }).session(session)
          await PayslipLine.insertMany(calculation.lines.map((line) => ({ ...line, payslipId: payslip._id, salaryRuleId: rules.find((rule) => rule.code === line.code)._id })), { session })
          totalGross += calculation.grossAmount
          totalNet += calculation.netAmount
          createdCount += 1
        } catch (error) {
          warnings.push(`${employee.employeeNumber}: ${error.message}`)
        }
      }

      payrun.status = 'computed'
      payrun.employeeCount = createdCount
      payrun.totalGross = Math.round(totalGross * 100) / 100
      payrun.totalNet = Math.round(totalNet * 100) / 100
      payrun.warnings = warnings
      await payrun.save({ session })
      result = payrun
    })
    return result
  } finally {
    await session.endSession()
  }
}

export async function validatePayrun(payrunId) {
  const payrun = await Payrun.findOne({ _id: payrunId, status: 'computed' })
  if (!payrun) throw payrunError('Only computed payruns can be validated', 409)
  const payslipCount = await Payslip.countDocuments({ payrunId, status: 'computed' })
  if (payrun.warnings.length || payslipCount !== payrun.employeeIds.length) throw payrunError('Payrun has unresolved warnings or incomplete payslips', 422)
  payrun.status = 'validated'
  payrun.validatedAt = new Date()
  await payrun.save()
  await Payslip.updateMany({ payrunId, status: 'computed' }, { status: 'validated' })
  return payrun
}

export async function markPayrunPaid(payrunId) {
  const payrun = await Payrun.findOneAndUpdate({ _id: payrunId, status: 'validated' }, { status: 'paid', paidAt: new Date() }, { new: true })
  if (!payrun) throw payrunError('Only validated payruns can be marked paid', 409)
  await Payslip.updateMany({ payrunId, status: 'validated' }, { status: 'paid' })
  return payrun
}

export async function sendPayrunPayslips(payrunId) {
  const payrun = await Payrun.findOne({ _id: payrunId, status: 'paid' })
  if (!payrun) throw payrunError('Only paid payruns can send payslips', 409)
  const sentAt = new Date()
  await Payslip.updateMany({ payrunId, status: 'paid' }, { sentAt })
  payrun.sentAt = sentAt
  await payrun.save()
  return { payrun, sentCount: await Payslip.countDocuments({ payrunId, sentAt }) }
}

export { payrunError }
