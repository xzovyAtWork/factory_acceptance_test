// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
    // Centralized error logging
    console.error(err);
  
    if (res.headersSent) {
      return next(err);
    }
  
    // Basic shape; you can expand with error codes/types later
    res.status(500).json({
      error: 'Internal server error',
    });
  };