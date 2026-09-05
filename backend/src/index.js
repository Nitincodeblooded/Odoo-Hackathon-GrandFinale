import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  console.log(`PeoplePay360 API running on port ${env.port}`)
  void connectDatabase(env.mongodbUri)
})
