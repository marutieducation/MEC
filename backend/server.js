const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
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
  console.error(`🚨 FATAL Error: Missing required env vars: ${missingEnv.join(', ')}`);
  console.error(`👉 Ensure these are set in your .env file or hosting provider's dashboard.`);
  process.exit(1);
}


connectDB();

const app = express();
const server = http.createServer(app);


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

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.options('*', cors());


const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
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


initCronJobs();


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/counsellors', require('./routes/counsellors'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/university-portal', require('./routes/universityPortal'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/scholarships', require('./routes/scholarships'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const serverInstance = server.listen(PORT, () => {
  console.log(`🚀 UAFMS Backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});


process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);

  serverInstance.close(() => process.exit(1));
});


process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  serverInstance.close(() => process.exit(1));
});


process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  serverInstance.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});
