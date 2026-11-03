const express  = require('express');
const bcrypt   = require('bcryptjs');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const initSqlJs = require('sql.js');

const app  = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'motorista.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── banco de dados (sql.js — SQLite em JS puro) ──
let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    db = new SQL.Database(fs.readFileSync(DB_FILE));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf       TEXT    UNIQUE NOT NULL,
      senha     TEXT    NOT NULL,
      pin       TEXT    NOT NULL,
      criado_em TEXT    DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS acessos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      cpf        TEXT NOT NULL,
      tipo       TEXT NOT NULL,
      ip         TEXT,
      feito_em   TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  saveDB();
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  return queryAll(sql, params)[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  // retorna lastInsertRowid
  const [{ id }] = queryAll('SELECT last_insert_rowid() AS id');
  return { lastInsertRowid: id };
}

// ── rotas ──

// POST /api/cadastro
app.post('/api/cadastro', (req, res) => {
  const { cpf, senha, pin } = req.body;

  if (!cpf || !senha || !pin)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11)
    return res.status(400).json({ erro: 'CPF inválido.' });
  if (senha.length < 6)
    return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 dígitos.' });
  if (!/^\d{4}$/.test(pin))
    return res.status(400).json({ erro: 'PIN deve ter 4 dígitos numéricos.' });

  const jaExiste = queryOne('SELECT id FROM usuarios WHERE cpf = ?', [cpfLimpo]);
  if (jaExiste)
    return res.status(409).json({ erro: 'CPF já cadastrado.' });

  const senhaHash = bcrypt.hashSync(senha, 10);
  const pinHash   = bcrypt.hashSync(pin, 10);

  const result = run(
    'INSERT INTO usuarios (cpf, senha, pin) VALUES (?, ?, ?)',
    [cpfLimpo, senhaHash, pinHash]
  );

  run(
    'INSERT INTO acessos (usuario_id, cpf, tipo, ip) VALUES (?, ?, ?, ?)',
    [result.lastInsertRowid, cpfLimpo, 'cadastro', req.ip]
  );

  res.json({ ok: true, mensagem: 'Cadastro realizado com sucesso!', id: result.lastInsertRowid });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { cpf, senha } = req.body;

  if (!cpf || !senha)
    return res.status(400).json({ erro: 'Informe CPF e senha.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  const usuario  = queryOne('SELECT * FROM usuarios WHERE cpf = ?', [cpfLimpo]);

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha))
    return res.status(401).json({ erro: 'CPF ou senha incorretos.' });

  run(
    'INSERT INTO acessos (usuario_id, cpf, tipo, ip) VALUES (?, ?, ?, ?)',
    [usuario.id, cpfLimpo, 'login', req.ip]
  );

  res.json({ ok: true, mensagem: 'Login realizado!', id: usuario.id });
});

// GET /api/admin/usuarios
app.get('/api/admin/usuarios', (_req, res) => {
  const lista = queryAll('SELECT id, cpf, criado_em FROM usuarios ORDER BY id DESC');
  res.json(lista);
});

// GET /api/admin/acessos
app.get('/api/admin/acessos', (_req, res) => {
  const lista = queryAll('SELECT * FROM acessos ORDER BY id DESC LIMIT 100');
  res.json(lista);
});

// ── start ──
initDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
});
