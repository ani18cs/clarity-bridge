const logger = require('./logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  const message = err.message || 'An unexpected internal server error occurred.';

  logger.error('API Error Encountered', {
    path: req.path,
    method: req.method,
    statusCode,
    errorName: err.name,
    errorMessage: message
  });

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message,
    statusCode
  });
}

module.exports = errorHandler;
