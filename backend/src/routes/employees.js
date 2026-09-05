import { Router } from 'express'
import Employee from '../models/Employee.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = Router()
const hrRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

router.get('/', authenticate, async (_request, response, next) => {
  try {
    const employees = await Employee.find().sort({ lastName: 1, firstName: 1 })
    return response.json({ employees })
  } catch (error) {
    return next(error)
  }
})

router.post('/', authenticate, authorize(...hrRoles), async (request, response, next) => {
  try {
    const { employeeNumber, firstName, lastName, workEmail, department, jobPosition, employeeType } = request.body
    const employee = await Employee.create({ employeeNumber, firstName, lastName, workEmail, department, jobPosition, employeeType })
    return response.status(201).json({ employee })
  } catch (error) {
    return next(error)
  }
})

export default router
