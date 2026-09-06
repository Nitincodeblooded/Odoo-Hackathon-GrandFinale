import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { getPayslipDetail, getPayslipPdf, getPayslipPrintView, payrollRoles } from '../controllers/payslips.js'

const router = Router()

router.use(authenticate, authorize(...payrollRoles))
router.get('/:payslipId', getPayslipDetail)
router.get('/:payslipId/pdf', getPayslipPdf)
router.get('/:payslipId/print', getPayslipPrintView)

export default router
