import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getPayslipPdf, getPayslipPrintView } from '../controllers/payslips.js'

const router = Router()

router.use(authenticate)
router.get('/:payslipId/pdf', getPayslipPdf)
router.get('/:payslipId/print', getPayslipPrintView)

export default router
