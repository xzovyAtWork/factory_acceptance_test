// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

module.exports = function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (!required) return next();
      return res.status(401).json({ error: 'Missing token' });
    }

    try {
      const payload = jwt.verify(token, secret);
      // payload: { userId, role, exp }
      req.user = { id: payload.userId, role: payload.role };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};