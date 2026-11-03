const { loadDB } = require('../_db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const db = loadDB();
  res.json(db.usuarios.map(({ id, cpf, criado_em }) => ({ id, cpf, criado_em })));
};
