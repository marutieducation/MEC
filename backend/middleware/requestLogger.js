const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
    userRole: req.user?.role,
    timestamp: new Date().toISOString()
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?._id,
      userRole: req.user?.role
    };

    if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?._id,
    userRole: req.user?.role,
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// Security event logger
const securityEventLogger = (eventType, details) => {
  logger.warn({
    eventType,
    ...details,
    timestamp: new Date().toISOString(),
    severity: 'high'
  });
};

module.exports = {
  requestLogger,
  errorLogger,
  securityEventLogger
};
