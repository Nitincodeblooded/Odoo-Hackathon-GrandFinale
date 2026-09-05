const port = Number.parseInt(process.env.PORT || '5000', 10)
const mongodbUri = process.env.MONGODB_URI || ''

if (Number.isNaN(port)) {
  throw new Error('PORT must be a valid number')
}

if (mongodbUri && !mongodbUri.startsWith('mongodb://') && !mongodbUri.startsWith('mongodb+srv://')) {
  throw new Error('MONGODB_URI must use the mongodb:// or mongodb+srv:// scheme')
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  mongodbUri,
}
