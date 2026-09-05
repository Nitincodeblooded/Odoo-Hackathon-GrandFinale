import Contract from '../models/Contract.js'

function createContractError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function validatePeriod(periodStart, periodEnd) {
  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end < start) {
    throw createContractError('Payroll period must contain valid dates and end on or after its start')
  }
  return { start, end }
}

export async function assertNoOverlappingActiveContract(employeeId, startDate, endDate, excludeContractId) {
  const query = {
    employeeId,
    status: 'active',
    $or: [{ endDate: null }, { endDate: { $gte: startDate } }],
  }
  if (endDate) query.startDate = { $lte: endDate }
  if (excludeContractId) query._id = { $ne: excludeContractId }

  if (await Contract.exists(query)) {
    throw createContractError('An active contract already overlaps this employee period', 409)
  }
}

export async function findApplicableContract(employeeId, periodStart, periodEnd) {
  const { start, end } = validatePeriod(periodStart, periodEnd)
  const contracts = await Contract.find({
    employeeId,
    status: 'active',
    startDate: { $lte: end },
    $or: [{ endDate: null }, { endDate: { $gte: start } }],
  }).sort({ startDate: -1 })

  if (contracts.length === 0) {
    throw createContractError('No active contract applies to this payroll period', 422)
  }
  if (contracts.length > 1) {
    throw createContractError('Multiple active contracts apply to this payroll period', 409)
  }
  return contracts[0]
}

export { validatePeriod }
