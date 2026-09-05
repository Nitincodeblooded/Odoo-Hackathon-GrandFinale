import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'

export async function authenticate(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

  if (!token) {
    return response.status(401).json({ error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findOne({ _id: payload.sub, active: true }).populate('employeeId')

    if (!user) {
      return response.status(401).json({ error: 'User is inactive or does not exist' })
    }

    request.user = user
    return next()
  } catch (_error) {
    return response.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function authorize(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ error: 'Insufficient permissions' })
    }
    return next()
  }
}

export function serializeUser(user) {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    active: user.active,
    employee: user.employeeId,
  }
}
