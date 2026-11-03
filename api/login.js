const { dbGet, dbInsert, hash } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ erro: 'Método não permitido.' });

  const { cpf, senha } = req.body || {};

  if (!cpf || !senha)
    return res.status(400).json({ erro: 'Informe CPF e senha.' });

  const cpfLimpo = cpf.replace(/\D/g, '');

  try {
    const u = await dbGet('usuarios', { cpf: cpfLimpo });
    if (!u || u.senha !== hash(senha))
      return res.status(401).json({ erro: 'CPF ou senha incorretos.' });

    res.json({ ok: true, mensagem: 'Login realizado!', id: u.id });
  } catch (err) {
    res.status(500).json({ erro: err.message || 'Erro interno.' });
  }
};
