const { dbList } = require('../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const lista = await dbList('usuarios');
    res.json(lista.map(({ id, cpf, criado_em }) => ({ id, cpf, criado_em })));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
