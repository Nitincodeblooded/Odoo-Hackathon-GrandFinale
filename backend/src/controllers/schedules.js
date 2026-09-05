import WorkingSchedule from '../models/WorkingSchedule.js'

export const scheduleManagementRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

export async function listSchedules(_request, response, next) {
  try {
    const schedules = await WorkingSchedule.find({ active: true }).sort({ name: 1 })
    return response.json({ schedules })
  } catch (error) {
    return next(error)
  }
}

export async function getSchedule(request, response, next) {
  try {
    const schedule = await WorkingSchedule.findById(request.params.scheduleId)
    if (!schedule) return response.status(404).json({ error: 'Working schedule not found' })
    return response.json({ schedule })
  } catch (error) {
    return next(error)
  }
}

export async function createSchedule(request, response, next) {
  try {
    const schedule = await WorkingSchedule.create(request.body)
    return response.status(201).json({ schedule })
  } catch (error) {
    return next(error)
  }
}

export async function updateSchedule(request, response, next) {
  try {
    const schedule = await WorkingSchedule.findById(request.params.scheduleId)
    if (!schedule) return response.status(404).json({ error: 'Working schedule not found' })
    Object.assign(schedule, request.body)
    await schedule.save()
    return response.json({ schedule })
  } catch (error) {
    return next(error)
  }
}

export async function deactivateSchedule(request, response, next) {
  try {
    const schedule = await WorkingSchedule.findByIdAndUpdate(request.params.scheduleId, { active: false }, { new: true })
    if (!schedule) return response.status(404).json({ error: 'Working schedule not found' })
    return response.json({ schedule })
  } catch (error) {
    return next(error)
  }
}
