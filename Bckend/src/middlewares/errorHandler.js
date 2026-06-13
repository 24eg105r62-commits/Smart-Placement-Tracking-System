import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for ${error.path}: ${error.value}`;
    }

    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors).map((e) => e.message).join(', ');
    }

    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      message = `${field} already exists`;
    }

    error = new ApiError(statusCode, message);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};
