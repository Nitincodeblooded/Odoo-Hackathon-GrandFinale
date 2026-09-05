import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { attendanceManagementRoles, checkIn, checkOut, createCorrection, getAttendance, listAttendance } from '../controllers/attendance.js'

const router = Router()

router.use(authenticate)
router.get('/', listAttendance)
router.get('/:attendanceId', getAttendance)
router.post('/check-in', checkIn)
router.post('/check-out', checkOut)
router.post('/corrections', authorize(...attendanceManagementRoles), createCorrection)

export default router
