const mongoose = require('mongoose');
const { ZodError } = require('zod');

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(error, req, res, next) {
  let status = error.status || 500;
  let message = error.message || 'Internal server error';
  let details;

  if (error instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
  } else if (error.code === 11000) {
    status = 409;
    message = `Duplicate value for ${Object.keys(error.keyPattern || {})[0] || 'unique field'}`;
  } else if (error instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(error.errors).map((item) => item.message).join('; ');
  } else if (error instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid identifier';
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) {
    console.error(error);
    message = 'Internal server error';
  }

  res.status(status).json({ success: false, message, ...(details ? { errors: details } : {}) });
}

module.exports = { notFound, errorHandler };
