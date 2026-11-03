const { neon } = require('@neondatabase/serverless');

function getSQL() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');
  return neon(process.env.DATABASE_URL);
}

const crypto = require('crypto');
function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = { getSQL, hash };
