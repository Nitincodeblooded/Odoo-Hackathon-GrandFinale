import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { currentUser, login, register, updateRole } from '../controllers/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, currentUser)
router.patch('/users/:userId/role', authenticate, authorize('admin'), updateRole)

export default router
