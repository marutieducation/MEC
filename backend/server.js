require('dotenv').config();
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { initCronJobs } = require('./utils/cronJobs');
const logger = require('./utils/logger');
const { generalLimiter, authLimiter, registerLimiter, passwordResetLimiter, paymentLimiter, uploadLimiter, searchLimiter, adminLimiter } = require('./middleware/rateLimit');
const { sanitizeInput } = require('./middleware/sanitize');
const { csrfTokenMiddleware, csrfProtection } = require('./middleware/csrf');
const { requestLogger, errorLogger } = require('./middleware/requestLogger');


// Ensure required directories exist
const fs = require('fs');
const path = require('path');
['logs', 'uploads'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created missing directory: ${dir}`);
  }
});


// Security validation on startup
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  const msg = `🚨 Missing required env vars: ${missingEnv.join(', ')}`;
  console.error(msg);
  console.error('👉 Ensure these are set in your .env file or Render/Netlify environment.');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

// CRITICAL: Prevent 2FA bypass in production
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_2FA_BYPASS === 'true') {
  console.error('🚨 SECURITY ERROR: ALLOW_DEV_2FA_BYPASS is enabled in production!');
  console.error('👉 Set ALLOW_DEV_2FA_BYPASS=false or remove from environment.');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

// Configure allowed origins for CORS and CSP
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://marutieducation.onrender.com', 'https://mec-frontend.onrender.com', 'https://mec-backend-9uu9.onrender.com'];
const allowAnyOrigin = allowedOrigins.includes('*');
const normalizeOrigin = (origin) => origin.replace(/\/$/, '');
const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

connectDB();

const app = express();
const server = http.createServer(app);
let serverInstance = null;

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply request logging to all routes
app.use(requestLogger);

// Apply input sanitization to all routes
app.use(sanitizeInput);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...allowedOrigins],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", ...allowedOrigins, process.env.NEXT_PUBLIC_API_URL || 'https://mec-backend-9uu9.onrender.com/api'],
      mediaSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      blockAllMixedContent: true,
    },
  } : false, // Disable CSP in development for easier debugging
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));



const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins to prevent "Failed to Fetch" errors
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // If wildcard explicitly set, allow all
    if (allowAnyOrigin) {
      return callback(null, true);
    }

    // Check whitelist
    if (normalizedAllowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));


const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && !process.env.ALLOWED_ORIGINS) {
        return callback(null, true);
      }
      if (allowAnyOrigin) {
        return callback(null, true);
      }
      if (normalizedAllowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error(`Socket.IO origin ${origin} not allowed`));
    },
    credentials: true,
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  if (!token) return next(new Error('Authentication required'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});


app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);


  socket.on('joinRoom', (userId) => {
    if (socket.userId !== userId) {
      console.warn(`[SOCKET] ⚠️ User ${socket.userId} attempted to join room for ${userId}`);
      return;
    }
    socket.join(userId);
    console.log(`👤 User ${userId} joined personal socket room.`);
  });

  socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
  });
});


if (!process.env.VERCEL) {
  try {
    initCronJobs();
  } catch (cronErr) {
    logger.error(`❌ Failed to initialize cron jobs: ${cronErr.message}\n${cronErr.stack}`);
    // Do NOT exit — cron failure must not kill the server
  }
}


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/counsellors', require('./routes/counsellors'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/university-portal', require('./routes/universityPortal'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/scholarships', require('./routes/scholarship'));
app.use('/api/interviews', require('./routes/interview'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/leads', require('./routes/leads'));


// Root route for Render default health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'MEC UAFMS API is running', 
    timestamp: new Date().toISOString() 
  });
});




app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  serverInstance = server.listen(PORT, () => {
    console.log(`🚀 UAFMS Backend running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    
    // Tell PM2 that we're ready for traffic
    if (process.send) {
      process.send('ready');
    }
  });

  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Is another server instance running?`);
      logger.error(`Port ${PORT} already in use (EADDRINUSE)`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err.message);
      logger.error(`Server error: ${err.message}\n${err.stack}`);
    }
  });

  // Keep-alive mechanism for Render free tier (pings itself every 14 minutes)
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      try {
        // Fallback for environments without global fetch
        const fetchMethod = typeof fetch !== 'undefined' ? fetch : null;
        if (fetchMethod) {
          const response = await fetchMethod(`http://localhost:${PORT}/api/health`);
          if (response.ok) {
            console.log('💓 Keep-alive ping successful');
          }
        }
      } catch (error) {
        console.error('❌ Keep-alive ping failed:', error.message);
      }
    }, 14 * 60 * 1000); // 14 minutes
  }
}

// Export for Vercel
module.exports = app;

process.on('unhandledRejection', (reason, promise) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : '';
  logger.error(`❌ Unhandled Promise Rejection: ${msg}\n${stack}`);
  console.error(`❌ Unhandled Rejection: ${msg}`);
  if (stack) console.error(stack);
  // In production, log and continue — do NOT crash the server for a single rejected promise
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.VERCEL) {
      if (serverInstance) {
        serverInstance.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    }
  }
});


process.on('uncaughtException', (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}\n${err.stack}`);
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Uncaught exceptions ARE fatal — always exit so the process manager restarts us cleanly
  if (serverInstance) {
    serverInstance.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  
  const closeDB = () => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close(false).then(() => {
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
      }).catch(err => {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  };

  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ HTTP Server closed.');
      closeDB();
    });
    
    // Force shutdown if it takes too long
    setTimeout(() => {
      console.error('🚨 Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    closeDB();
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
