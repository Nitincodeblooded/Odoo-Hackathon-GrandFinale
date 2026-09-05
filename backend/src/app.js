import cors from 'cors'
import express from 'express'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import employeesRouter from './routes/employees.js'
import contractsRouter from './routes/contracts.js'
import schedulesRouter from './routes/schedules.js'
import attendanceRouter from './routes/attendance.js'
import timeOffRouter from './routes/timeOff.js'
import salaryRouter from './routes/salary.js'
import payrunsRouter from './routes/payruns.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/contracts', contractsRouter)
app.use('/api/working-schedules', schedulesRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/time-off', timeOffRouter)
app.use('/api/salary-structures', salaryRouter)
app.use('/api/payruns', payrunsRouter)

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  if (error.code === 11000) {
    return response.status(409).json({ error: 'A record with one of these unique values already exists' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  return response.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error' })
})

export default app
