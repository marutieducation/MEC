const mongoose = require('mongoose');

let listenersAttached = false;
let reconnectTimer = null;

const getRetryMs = () => {
  const retryMs = Number(process.env.DB_RETRY_MS || 30000);
  return Number.isFinite(retryMs) && retryMs > 0 ? retryMs : 30000;
};

const getNumberEnv = (key, fallback) => {
  const value = Number(process.env[key] || fallback);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const maskMongoUri = (mongoUri) => mongoUri.replace(/\/\/([^@]+)@/, '//****:****@');

const scheduleReconnect = (options) => {
  if (reconnectTimer) return;

  const retryMs = getRetryMs();
  console.warn(`[DB] MongoDB unavailable. Retrying in ${Math.round(retryMs / 1000)}s...`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectDB(options).catch((error) => {
      console.error(`[DB] Retry failed before connect handler completed: ${error.message}`);
    });
  }, retryMs);
};

const attachConnectionListeners = (options) => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected. Mongoose will attempt to reconnect.');
    if (process.env.NODE_ENV === 'production') {
      scheduleReconnect(options);
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err.message);
  });
};

const connectDB = async (options = {}) => {
  const { exitOnFailure = false } = options;

  let mongoUri = (process.env.MONGO_URI || '').trim();
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  mongoUri = mongoUri.replace(/[\r\n]/g, '');
  attachConnectionListeners(options);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    console.log('[DB] MongoDB connection already in progress.');
    return mongoose.connection;
  }

  try {
    const isCloud = mongoUri.includes('mongodb+srv');
    console.log(`[DB] Connecting to ${isCloud ? 'Atlas' : 'MongoDB'}...`);
    console.log(`[DB] Target: ${maskMongoUri(mongoUri)}`);

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: getNumberEnv('MONGO_SERVER_SELECTION_TIMEOUT_MS', 10000),
      socketTimeoutMS: 60000,
      connectTimeoutMS: getNumberEnv('MONGO_CONNECT_TIMEOUT_MS', 10000),
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    console.log(`[DB] Database name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DB] Initial MongoDB connection failed: ${error.message}`);
    console.error('[DB] Verify MONGO_URI in Render and allow Render outbound access in MongoDB Atlas.');

    if (exitOnFailure) {
      process.exit(1);
    }

    scheduleReconnect(options);
    return null;
  }
};

module.exports = connectDB;
