const { query } = require('../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        cpf TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        pin TEXT NOT NULL,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const rows = await query(`
      SELECT id, cpf, senha, pin, criado_em
      FROM usuarios
      ORDER BY criado_em DESC
    `);

    res.json({ ok: true, total: rows.length, usuarios: rows });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
