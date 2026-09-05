import mongoose from 'mongoose'

export async function connectDatabase(uri) {
  if (!uri) {
    console.warn('MONGODB_URI is not configured; running without a database connection')
    return false
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    })
    console.log('MongoDB connected')
    return true
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    console.error('Check the Atlas connection string, database user, and Network Access IP allowlist')
    return false
  }
}

export function getDatabaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  return states[mongoose.connection.readyState] || 'unknown'
}
