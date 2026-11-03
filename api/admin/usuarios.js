const { query } = require('../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const rows = await query('SELECT id, cpf, criado_em FROM usuarios ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
