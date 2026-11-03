const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// Vercel: /tmp é o único diretório gravável (não persiste entre deploys,
// mas funciona durante a vida da função)
const DB_PATH = path.join('/tmp', 'motorista_db.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {}
  return { usuarios: [], acessos: [] };
}

function saveDB(data) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(data)); } catch {}
}

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = { loadDB, saveDB, hash };
