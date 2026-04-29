const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const isCloud = process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv');
      console.log(`⏳ [DB] Connection attempt ${attempt}/${retries} to ${isCloud ? 'Atlas' : 'Local'}...`);

      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📁 Database Name: ${conn.connection.name}`);


      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected! App may be unstable.');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected.');
      });

      return;
    } catch (error) {
      console.error(`❌ DB Connection failed (Attempt ${attempt}): ${error.message}`);
      if (attempt === retries) {
        console.warn('⚠️ All DB retry attempts to primary URI failed. Attempting fallback to local MongoDB...');
        try {
          const fallbackUri = 'mongodb:
          const conn = await mongoose.connect(fallbackUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
          });
          console.log(`✅ Local MongoDB Fallback Connected: ${conn.connection.host}`);
          return;
        } catch (localErr) {
          console.error(`🚨 Fallback to local MongoDB also failed: ${localErr.message}. Starting server in degraded mode (API will fail).`);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

module.exports = connectDB;
