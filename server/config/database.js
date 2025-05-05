const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'firanmit',
  password: 'firanmit1234!',
  database: 'matcha_db', // Create this database first
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;