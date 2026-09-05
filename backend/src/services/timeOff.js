import mongoose from 'mongoose'
import TimeOffAllocation from '../models/TimeOffAllocation.js'
import TimeOffRequest from '../models/TimeOffRequest.js'
import TimeOffType from '../models/TimeOffType.js'

function workflowError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function validDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) throw workflowError('Date must be valid')
  return date
}

export function calculateRequestedAmount(unit, startDate, endDate, requestedAmount) {
  if (unit === 'hours') {
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) throw workflowError('requestedAmount must be greater than zero for hourly leave')
    return requestedAmount
  }
  const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()))
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))
  return Math.floor((end - start) / 86400000) + 1
}

export async function validateTimeOffRequest(data) {
  const type = await TimeOffType.findOne({ _id: data.timeOffTypeId, active: true })
  if (!type) throw workflowError('Active time-off type not found', 404)
  const startDate = validDate(data.startDate)
  const endDate = validDate(data.endDate)
  if (endDate < startDate) throw workflowError('Time-off end date cannot precede start date')
  const requestedAmount = calculateRequestedAmount(type.unit, startDate, endDate, data.requestedAmount)
  if (type.requiresAllocation && !(await TimeOffAllocation.exists({
    employeeId: data.employeeId,
    timeOffTypeId: type._id,
    status: 'approved',
    validFrom: { $lte: endDate },
    validTo: { $gte: startDate },
    $expr: { $gte: [{ $subtract: ['$allocatedAmount', '$usedAmount'] }, requestedAmount] },
  }))) {
    throw workflowError('No approved allocation has enough remaining balance for this request', 422)
  }
  return { type, startDate, endDate, requestedAmount }
}

export async function approveTimeOffRequest(requestId, approverEmployeeId) {
  const session = await mongoose.startSession()
  try {
    let approvedRequest
    await session.withTransaction(async () => {
      const request = await TimeOffRequest.findOne({ _id: requestId, status: 'submitted' }).session(session)
      if (!request) throw workflowError('Only submitted requests can be approved', 409)
      const type = await TimeOffType.findById(request.timeOffTypeId).session(session)
      if (!type) throw workflowError('Time-off type not found', 404)

      if (type.requiresAllocation) {
        const allocation = await TimeOffAllocation.findOneAndUpdate(
          {
            employeeId: request.employeeId,
            timeOffTypeId: request.timeOffTypeId,
            status: 'approved',
            validFrom: { $lte: request.endDate },
            validTo: { $gte: request.startDate },
            $expr: { $gte: [{ $subtract: ['$allocatedAmount', '$usedAmount'] }, request.requestedAmount] },
          },
          { $inc: { usedAmount: request.requestedAmount } },
          { new: true, session },
        )
        if (!allocation) throw workflowError('Allocation balance is no longer available', 409)
        request.allocationId = allocation._id
      }

      request.status = 'approved'
      request.approvedBy = approverEmployeeId
      request.approvedAt = new Date()
      approvedRequest = await request.save({ session })
    })
    return approvedRequest
  } finally {
    await session.endSession()
  }
}

export { workflowError }
