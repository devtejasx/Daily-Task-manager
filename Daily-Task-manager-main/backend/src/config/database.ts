import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager'
    await mongoose.connect(uri)
    console.log('✅ MongoDB connected successfully')
    return true
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed:', error instanceof Error ? error.message : error)
    console.log('⚠️ Running in offline mode - some features may be limited')
    
    // Don't exit - allow the app to run without MongoDB for development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    return false
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('Database disconnected')
  } catch (error) {
    console.error('Error disconnecting database:', error)
  }
}
