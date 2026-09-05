import Payrun from '../models/Payrun.js'
import Payslip from '../models/Payslip.js'
import { computePayrun, createPayrun, getEligibleEmployees, markPayrunPaid, sendPayrunPayslips, validatePayrun } from '../services/payruns.js'

export const payrollRoles = ['hr_payroll_user', 'hr_payroll_manager', 'admin']

export async function previewPayrun(request, response, next) {
  try {
    const preview = await getEligibleEmployees(request.body.salaryStructureId, request.body.periodStart, request.body.periodEnd)
    return response.json({
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
      eligibleEmployees: preview.eligible.map(({ employee, contract, warnings }) => ({ employee, contract, warnings })),
      ineligibleEmployees: preview.ineligible,
    })
  } catch (error) { return next(error) }
}

export async function createPayrunController(request, response, next) {
  try {
    const payrun = await createPayrun(request.body)
    return response.status(201).json({ payrun })
  } catch (error) { return next(error) }
}

export async function listPayruns(_request, response, next) {
  try {
    const payruns = await Payrun.find().populate('salaryStructureId', 'name code').sort({ periodStart: -1, createdAt: -1 })
    return response.json({ payruns })
  } catch (error) { return next(error) }
}

export async function getPayrun(request, response, next) {
  try {
    const payrun = await Payrun.findById(request.params.payrunId).populate('salaryStructureId', 'name code').populate('employeeIds', 'employeeNumber firstName lastName')
    if (!payrun) return response.status(404).json({ error: 'Payrun not found' })
    const payslips = await Payslip.find({ payrunId: payrun._id }).populate('employeeId', 'employeeNumber firstName lastName').sort({ 'employeeSnapshot.name': 1 })
    return response.json({ payrun, payslips })
  } catch (error) { return next(error) }
}

export async function computePayrunController(request, response, next) {
  try {
    return response.json({ payrun: await computePayrun(request.params.payrunId) })
  } catch (error) { return next(error) }
}

export async function validatePayrunController(request, response, next) {
  try {
    return response.json({ payrun: await validatePayrun(request.params.payrunId) })
  } catch (error) { return next(error) }
}

export async function markPaidController(request, response, next) {
  try {
    return response.json({ payrun: await markPayrunPaid(request.params.payrunId) })
  } catch (error) { return next(error) }
}

export async function sendPayslipsController(request, response, next) {
  try {
    const result = await sendPayrunPayslips(request.params.payrunId)
    return response.json({ payrun: result.payrun, sentCount: result.sentCount, message: 'Payslips marked for delivery' })
  } catch (error) { return next(error) }
}
