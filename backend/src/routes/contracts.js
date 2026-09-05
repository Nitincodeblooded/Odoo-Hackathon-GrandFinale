import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { contractManagementRoles, createContract, getApplicableContract, getContract, listContracts, updateContract } from '../controllers/contracts.js'

const router = Router()

router.use(authenticate)
router.get('/applicable', getApplicableContract)
router.get('/', listContracts)
router.get('/:contractId', getContract)
router.post('/', authorize(...contractManagementRoles), createContract)
router.patch('/:contractId', authorize(...contractManagementRoles), updateContract)

export default router
