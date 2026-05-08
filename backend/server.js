const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');
const { initCronJobs } = require('./utils/cronJobs');


dotenv.config();


const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`🚨 Warning: Missing required env vars: ${missingEnv.join(', ')}`);
  console.error(`👉 Ensure these are set in your .env file or hosting provider's dashboard.`);
  // Don't process.exit(1) on Vercel as it crashes the whole function
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}


connectDB();

const app = express();
const server = http.createServer(app);
let serverInstance = null;


app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));



const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});


const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*'];
const allowAnyOrigin = allowedOrigins.includes('*');
const normalizeOrigin = (origin) => origin.replace(/\/$/, '');
const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== 'production' || allowAnyOrigin) {
      return callback(null, true);
    }

    if (normalizedAllowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));


const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' && !allowAnyOrigin ? allowedOrigins : true,
    credentials: true,
  }
});


app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);


  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined personal socket room.`);
  });

  socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
  });
});


if (!process.env.VERCEL) {
  initCronJobs();
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
app.use('/api/chat', require('./routes/chat'));



app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  serverInstance = server.listen(PORT, () => {
    console.log(`🚀 UAFMS Backend running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel
module.exports = app;

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (!process.env.VERCEL) {
    if (serverInstance) {
      serverInstance.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }
});


process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  if (serverInstance) {
    serverInstance.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});


process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  if (!serverInstance) {
    process.exit(0);
  }

  serverInstance.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
