import { Router } from 'express'
import { getDatabaseStatus } from '../config/database.js'

const router = Router()

router.get('/', (_request, response) => {
  const database = getDatabaseStatus()

  response.json({
    status: 'ok',
    service: 'peoplepay360-api',
    database,
    timestamp: new Date().toISOString(),
  })
})

export default router
