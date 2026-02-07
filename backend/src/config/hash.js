// hash.js
const bcrypt = require('bcrypt');

const password = 'admin123'; // change this to whatever you want
const rounds = 10;

bcrypt.hash(password, rounds).then(hash => {
  console.log('Hash:', hash);
});