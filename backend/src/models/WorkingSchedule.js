import mongoose from 'mongoose'

const daySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true, match: /^([01]\\d|2[0-3]):[0-5]\\d$/ },
  endTime: { type: String, required: true, match: /^([01]\\d|2[0-3]):[0-5]\\d$/ },
  breakMinutes: { type: Number, default: 0, min: 0 },
}, { _id: false })

const workingScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['standard', 'custom'], default: 'standard' },
  days: { type: [daySchema], default: [] },
  weeklyHours: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.model('WorkingSchedule', workingScheduleSchema)
