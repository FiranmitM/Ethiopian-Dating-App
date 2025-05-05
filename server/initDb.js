// server/initDb.js
const fs = require('fs');
const path = require('path');
const db = require('./db');

const schemaPath = path.join(__dirname, '../db/init.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

db.query(schemaSql, (err, result) => {
  if (err) {
    console.error('❌ Error initializing database schema:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database schema initialized successfully.');
    process.exit(0);
  }
});
