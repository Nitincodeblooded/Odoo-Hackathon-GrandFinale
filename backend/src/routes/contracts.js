import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { contractManagementRoles, createContract, getApplicableContract, getContract, listContracts, updateContract } from '../controllers/contracts.js'

const router = Router()

router.use(authenticate, authorize(...contractManagementRoles))
router.get('/applicable', getApplicableContract)
router.get('/', listContracts)
router.get('/:contractId', getContract)
router.post('/', createContract)
router.patch('/:contractId', updateContract)

export default router
