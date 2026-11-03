const { Client } = require('pg');
const crypto = require('crypto');

async function query(text, params = []) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    await client.end();
  }
}

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = { query, hash };
