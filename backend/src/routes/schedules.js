import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createSchedule, deactivateSchedule, getSchedule, listSchedules, scheduleManagementRoles, updateSchedule } from '../controllers/schedules.js'

const router = Router()

router.use(authenticate, authorize(...scheduleManagementRoles))
router.get('/', listSchedules)
router.get('/:scheduleId', getSchedule)
router.post('/', createSchedule)
router.patch('/:scheduleId', updateSchedule)
router.delete('/:scheduleId', deactivateSchedule)

export default router
