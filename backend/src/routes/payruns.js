import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  computePayrunController,
  createPayrunController,
  getPayrun,
  listPayruns,
  markPaidController,
  payrollRoles,
  previewPayrun,
  sendPayslipsController,
  validatePayrunController,
} from '../controllers/payruns.js'

const router = Router()

router.use(authenticate, authorize(...payrollRoles))
router.post('/preview', previewPayrun)
router.post('/', createPayrunController)
router.get('/', listPayruns)
router.get('/:payrunId', getPayrun)
router.post('/:payrunId/compute', computePayrunController)
router.post('/:payrunId/validate', validatePayrunController)
router.post('/:payrunId/mark-paid', markPaidController)
router.post('/:payrunId/send-payslips', sendPayslipsController)

export default router
