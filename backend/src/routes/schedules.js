import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createSchedule, deactivateSchedule, getSchedule, listSchedules, scheduleManagementRoles, updateSchedule } from '../controllers/schedules.js'

const router = Router()

router.use(authenticate)
router.get('/', listSchedules)
router.get('/:scheduleId', getSchedule)
router.post('/', authorize(...scheduleManagementRoles), createSchedule)
router.patch('/:scheduleId', authorize(...scheduleManagementRoles), updateSchedule)
router.delete('/:scheduleId', authorize(...scheduleManagementRoles), deactivateSchedule)

export default router
