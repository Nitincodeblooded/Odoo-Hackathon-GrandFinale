import mongoose from 'mongoose'
import { attendanceStatuses } from './enums.js'

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  workDate: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  workedHours: { type: Number, default: 0, min: 0 },
  overtimeHours: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: attendanceStatuses, default: 'present', index: true },
  correctionNote: { type: String, trim: true },
  manuallyCorrected: { type: Boolean, default: false },
}, { timestamps: true })

attendanceSchema.index({ employeeId: 1, workDate: 1 }, { unique: true })

attendanceSchema.pre('validate', function validateTimes(next) {
  if (this.checkIn && this.checkOut && this.checkOut < this.checkIn) {
    this.invalidate('checkOut', 'Check-out cannot precede check-in')
  }
  next()
})

export default mongoose.model('Attendance', attendanceSchema)
