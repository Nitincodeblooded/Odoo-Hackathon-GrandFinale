import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  approveAllocation,
  approveRequest,
  createAllocation,
  createRequest,
  createType,
  listAllocations,
  listRequests,
  listTypes,
  refuseRequest,
  updateType,
} from '../controllers/timeOff.js'
import { timeOffManagementRoles } from '../controllers/timeOff.js'

const router = Router()

router.use(authenticate)
router.get('/types', listTypes)
router.post('/types', authorize(...timeOffManagementRoles), createType)
router.patch('/types/:typeId', authorize(...timeOffManagementRoles), updateType)
router.get('/allocations', listAllocations)
router.post('/allocations', authorize(...timeOffManagementRoles), createAllocation)
router.post('/allocations/:allocationId/approve', authorize(...timeOffManagementRoles), approveAllocation)
router.get('/requests', listRequests)
router.post('/requests', createRequest)
router.post('/requests/:requestId/approve', authorize(...timeOffManagementRoles), approveRequest)
router.post('/requests/:requestId/refuse', authorize(...timeOffManagementRoles), refuseRequest)

export default router
