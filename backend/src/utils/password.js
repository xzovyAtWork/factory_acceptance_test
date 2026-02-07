// utils/password.js
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

exports.hashPassword = async (plain) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

exports.comparePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};