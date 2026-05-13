const winston = require('winston');
require('winston-daily-rotate-file');
const { format, transports } = winston;
const path = require('path');

const fs = require('fs');
const logDir = 'logs';

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/application-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: format.combine(
    format.timestamp(),
    format.json()
  )
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'uafms-backend' },
  transports: [
    dailyRotateFileTransport,
    new transports.File({ 
      filename: `${logDir}/error.log`, 
      level: 'error',
      format: format.combine(format.timestamp(), format.json())
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

module.exports = logger;
