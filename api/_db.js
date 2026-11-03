const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function headers() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };
}

async function dbGet(table, filters = {}) {
  const params = Object.entries(filters).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}&limit=1`;
  const r = await fetch(url, { headers: headers() });
  const rows = await r.json();
  return rows[0] || null;
}

async function dbInsert(table, data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  });
  const rows = await r.json();
  if (!r.ok) throw new Error(rows.message || 'Erro ao salvar.');
  return rows[0];
}

async function dbList(table, limit = 100) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id.desc&limit=${limit}`, { headers: headers() });
  return r.json();
}

const crypto = require('crypto');
function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = { dbGet, dbInsert, dbList, hash };
