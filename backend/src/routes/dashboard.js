import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { getDashboard } from '../controllers/dashboard.js'

const router = Router()
const dashboardRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

router.get('/', authenticate, authorize(...dashboardRoles), getDashboard)

export default router
