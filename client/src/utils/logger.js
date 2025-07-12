// client/src/utils/logger.js
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logs = [];
  }

  log(level, message, data = null) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);

    if (this.isDevelopment) {
      console[level](message, data);
    }

    // Send to server in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToServer(logEntry);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  sendToServer(logEntry) {
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(err => {
      console.error('Failed to send log to server:', err);
    });
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export default new Logger();