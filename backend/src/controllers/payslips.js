import Payslip from '../models/Payslip.js'
import { payslipFileName, renderPayslipPdf } from '../services/payslipPdf.js'

export const payrollRoles = ['hr_payroll_user', 'hr_payroll_manager', 'admin']

function canManagePayslip(user, payslip) {
  return payrollRoles.includes(user.role) || payslip.employeeId?._id?.toString() === user.employeeId?._id?.toString()
}

export async function getPayslipPdf(request, response, next) {
  try {
    const payslip = await Payslip.findById(request.params.payslipId).populate('employeeId', 'employeeNumber workEmail firstName lastName')
    if (!payslip) return response.status(404).json({ error: 'Payslip not found' })
    if (!canManagePayslip(request.user, payslip)) return response.status(403).json({ error: 'You cannot access this payslip' })
    const pdf = await renderPayslipPdf(payslip)
    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `inline; filename="${payslipFileName(payslip)}"`)
    return response.send(pdf)
  } catch (error) { return next(error) }
}

export async function getPayslipPrintView(request, response, next) {
  try {
    const payslip = await Payslip.findById(request.params.payslipId).populate('employeeId', 'employeeNumber firstName lastName')
    if (!payslip) return response.status(404).json({ error: 'Payslip not found' })
    if (!canManagePayslip(request.user, payslip)) return response.status(403).json({ error: 'You cannot access this payslip' })
    return response.type('html').send(`<!doctype html><html><head><title>Payslip ${payslip.employeeSnapshot?.name || ''}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;color:#17211b}h1{color:#295448}.total{font-size:1.4rem;font-weight:bold;border-top:1px solid #ccc;padding-top:12px}</style></head><body><h1>PeoplePay360 Payslip</h1><p>Employee: ${payslip.employeeSnapshot?.name || ''}</p><p>Period: ${payslip.periodStart.toISOString().slice(0, 10)} to ${payslip.periodEnd.toISOString().slice(0, 10)}</p><p>Gross: ${payslip.grossAmount.toFixed(2)}</p><p>Deductions: ${payslip.deductionAmount.toFixed(2)}</p><p class="total">Net salary: ${payslip.netAmount.toFixed(2)}</p><script>window.print()</script></body></html>`)
  } catch (error) { return next(error) }
}
