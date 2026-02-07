// src/db/queries/users.js
const db = require('../../config/db');

exports.createUser = async ({ email, passwordHash, fullName, role }) => {
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1,$2,$3,$4)
     RETURNING id, email, full_name, role, is_active`,
    [email, passwordHash, fullName, role]
  );
  return rows[0];
};

exports.getUserById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
};