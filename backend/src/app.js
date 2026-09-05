import cors from 'cors'
import express from 'express'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import employeesRouter from './routes/employees.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/employees', employeesRouter)

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})

export default app
