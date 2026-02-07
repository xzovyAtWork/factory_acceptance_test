// src/controllers/authController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');
const { comparePassword } = require('../utils/password');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query(
      'SELECT id, password_hash, role, is_active FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn }
    );

    res.json({
      token,
      user: { id: user.id, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};