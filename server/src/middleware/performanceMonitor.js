// server/src/middleware/performanceMonitor.js
const logger = require('../utils/logger');

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  logger.info('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`
      });
    }

    originalEnd.apply(this, args);
  };

  next();
};

module.exports = performanceMonitor;