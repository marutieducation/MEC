const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    const isCloud = mongoUri.includes('mongodb+srv');
    console.log(`⏳ [DB] Connecting to ${isCloud ? 'Atlas' : 'Local'}...`);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);

    // Native Mongoose connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected! Mongoose will automatically attempt to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (error) {
    console.error(`🚨 CRITICAL ERROR: Initial DB Connection failed: ${error.message}`);
    console.error('👉 Please check your MONGO_URI and IP Whitelist in MongoDB Atlas.');
    
    // Fail fast on initial connection failure. 
    // The process manager (PM2/Docker) will automatically restart the app.
    process.exit(1);
  }
};

module.exports = connectDB;
