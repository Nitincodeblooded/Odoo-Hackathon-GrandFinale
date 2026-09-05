import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { createEmployee, deactivateEmployee, employeeManagementRoles, getEmployee, listEmployees, updateEmployee } from '../controllers/employees.js'

const router = Router()

router.use(authenticate)
router.get('/', listEmployees)
router.get('/:employeeId', getEmployee)
router.post('/', authorize(...employeeManagementRoles), createEmployee)
router.patch('/:employeeId', authorize(...employeeManagementRoles), updateEmployee)
router.delete('/:employeeId', authorize(...employeeManagementRoles), deactivateEmployee)

export default router
