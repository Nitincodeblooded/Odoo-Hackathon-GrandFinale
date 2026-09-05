import mongoose from 'mongoose'

const daySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  breakMinutes: { type: Number, default: 0, min: 0 },
}, { _id: false })

const workingScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['standard', 'custom'], default: 'standard' },
  days: { type: [daySchema], default: [] },
  weeklyHours: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + minutes
}

workingScheduleSchema.pre('validate', function calculateWeeklyHours(next) {
  const dayNumbers = new Set()
  let totalMinutes = 0

  for (const day of this.days) {
    if (dayNumbers.has(day.dayOfWeek)) {
      this.invalidate('days', 'A working schedule cannot contain duplicate days')
      continue
    }
    dayNumbers.add(day.dayOfWeek)

    const startMinutes = timeToMinutes(day.startTime)
    const endMinutes = timeToMinutes(day.endTime)
    if (endMinutes <= startMinutes) {
      this.invalidate('days', 'End time must be after start time')
      continue
    }
    const netMinutes = (endMinutes - startMinutes) - day.breakMinutes
    if (netMinutes < 0) {
      this.invalidate('days', 'Break cannot exceed the scheduled working interval')
      continue
    }
    totalMinutes += netMinutes
  }

  this.weeklyHours = Math.round((totalMinutes / 60) * 100) / 100
  next()
})

export default mongoose.model('WorkingSchedule', workingScheduleSchema)
