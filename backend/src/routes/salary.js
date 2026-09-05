import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  calculateStructure,
  createRule,
  createStructure,
  deactivateRule,
  getStructure,
  listRules,
  listStructures,
  salaryReadRoles,
  salaryWriteRoles,
  updateRule,
  updateStructure,
} from '../controllers/salary.js'

const router = Router()

router.use(authenticate, authorize(...salaryReadRoles))
router.get('/', listStructures)
router.get('/:structureId', getStructure)
router.get('/:structureId/rules', listRules)
router.post('/:structureId/calculate', calculateStructure)
router.post('/', authorize(...salaryWriteRoles), createStructure)
router.patch('/:structureId', authorize(...salaryWriteRoles), updateStructure)
router.post('/:structureId/rules', authorize(...salaryWriteRoles), createRule)
router.patch('/:structureId/rules/:ruleId', authorize(...salaryWriteRoles), updateRule)
router.delete('/:structureId/rules/:ruleId', authorize(...salaryWriteRoles), deactivateRule)

export default router
