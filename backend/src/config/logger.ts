import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'task-manager-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: [
    // Error logs - file (5MB per file, keep 10 files)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Combined logs - file with daily rotation
    new (require('winston-daily-rotate-file'))({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxDays: '14d',
      format: customFormat
    }),

    // Console output (development only)
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message, timestamp, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} [${level}]: ${message} ${metaStr}`;
              })
            )
          })
        ]
      : [])
  ]
});

// Add metadata to log context
logger.addContext = (context: Record<string, any>) => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    ...context
  };
};

// Custom log methods for specific use cases
logger.logRequest = (req: any, res: any, duration: number) => {
  logger.info('HTTP Request', {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

logger.logDatabaseQuery = (query: string, duration: number, params?: any[]) => {
  logger.debug('Database Query', {
    query,
    duration: `${duration}ms`,
    params: params?.length ? `${params.length} parameters` : 'none'
  });
};

logger.logApiCall = (service: string, endpoint: string, duration: number, statusCode: number) => {
  logger.info('External API Call', {
    service,
    endpoint,
    duration: `${duration}ms`,
    statusCode
  });
};

logger.logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error Occurred', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

export default logger;
