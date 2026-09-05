import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

export const attendanceManagementRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

function canManageAttendance(user) {
  return attendanceManagementRoles.includes(user.role)
}

function currentEmployeeId(user) {
  return user.employeeId?._id || user.employeeId
}

function normalizeWorkDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) {
    const error = new Error('workDate must be a valid date')
    error.statusCode = 400
    throw error
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

async function assertActiveEmployee(employeeId) {
  if (!(await Employee.exists({ _id: employeeId, status: 'active' }))) {
    const error = new Error('Active employee not found')
    error.statusCode = 400
    throw error
  }
}

function attendanceForResponse(attendance) {
  return attendance.populate('employeeId', 'employeeNumber firstName lastName department')
}

export async function listAttendance(request, response, next) {
  try {
    const filter = canManageAttendance(request.user)
      ? (request.query.employeeId ? { employeeId: request.query.employeeId } : {})
      : { employeeId: currentEmployeeId(request.user) }
    if (request.query.status) filter.status = request.query.status
    const attendance = await Attendance.find(filter).populate('employeeId', 'employeeNumber firstName lastName department').sort({ workDate: -1 })
    return response.json({ attendance })
  } catch (error) {
    return next(error)
  }
}

export async function getAttendance(request, response, next) {
  try {
    const attendance = await Attendance.findById(request.params.attendanceId).populate('employeeId', 'employeeNumber firstName lastName department')
    if (!attendance) return response.status(404).json({ error: 'Attendance record not found' })
    if (!canManageAttendance(request.user) && attendance.employeeId._id.toString() !== currentEmployeeId(request.user).toString()) {
      return response.status(403).json({ error: 'You can only access your own attendance' })
    }
    return response.json({ attendance })
  } catch (error) {
    return next(error)
  }
}

export async function checkIn(request, response, next) {
  try {
    const employeeId = canManageAttendance(request.user) && request.body.employeeId ? request.body.employeeId : currentEmployeeId(request.user)
    await assertActiveEmployee(employeeId)
    const workDate = normalizeWorkDate(request.body.workDate || new Date())
    const checkInTime = request.body.checkIn ? new Date(request.body.checkIn) : new Date()
    if (Number.isNaN(checkInTime.valueOf())) return response.status(400).json({ error: 'checkIn must be a valid date-time' })
    const attendance = await Attendance.create({ employeeId, workDate, checkIn: checkInTime, status: 'missing_checkout' })
    return response.status(201).json({ attendance: await attendanceForResponse(attendance) })
  } catch (error) {
    return next(error)
  }
}

export async function checkOut(request, response, next) {
  try {
    const employeeId = currentEmployeeId(request.user)
    const workDate = normalizeWorkDate(request.body.workDate || new Date())
    const attendance = await Attendance.findOne({ employeeId, workDate })
    if (!attendance) return response.status(404).json({ error: 'No check-in found for this work date' })
    if (attendance.checkOut) return response.status(409).json({ error: 'Attendance is already checked out' })
    const checkOutTime = request.body.checkOut ? new Date(request.body.checkOut) : new Date()
    if (Number.isNaN(checkOutTime.valueOf())) return response.status(400).json({ error: 'checkOut must be a valid date-time' })
    attendance.checkOut = checkOutTime
    await attendance.save()
    return response.json({ attendance: await attendanceForResponse(attendance) })
  } catch (error) {
    return next(error)
  }
}

export async function createCorrection(request, response, next) {
  try {
    const employeeId = request.body.employeeId
    await assertActiveEmployee(employeeId)
    if (typeof request.body.correctionNote !== 'string' || request.body.correctionNote.trim().length < 3) {
      return response.status(400).json({ error: 'A correctionNote of at least 3 characters is required' })
    }
    const data = {
      employeeId,
      workDate: normalizeWorkDate(request.body.workDate),
      checkIn: request.body.checkIn ? new Date(request.body.checkIn) : undefined,
      checkOut: request.body.checkOut ? new Date(request.body.checkOut) : undefined,
      status: request.body.status || 'corrected',
      correctionNote: request.body.correctionNote.trim(),
      manuallyCorrected: true,
    }
    if (data.checkIn && data.checkOut && data.checkOut >= data.checkIn) {
      data.workedHours = Math.round(((data.checkOut - data.checkIn) / 3600000) * 100) / 100
    }
    const attendance = await Attendance.findOneAndUpdate({ employeeId, workDate: data.workDate }, data, { new: true, upsert: true, runValidators: true })
    return response.status(200).json({ attendance: await attendanceForResponse(attendance) })
  } catch (error) {
    return next(error)
  }
}
