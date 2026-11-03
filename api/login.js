const { loadDB, saveDB, hash } = require('./_db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ erro: 'Método não permitido.' });

  const { cpf, senha } = req.body || {};

  if (!cpf || !senha)
    return res.status(400).json({ erro: 'Informe CPF e senha.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  const db = loadDB();
  const u  = db.usuarios.find(u => u.cpf === cpfLimpo && u.senha === hash(senha));

  if (!u)
    return res.status(401).json({ erro: 'CPF ou senha incorretos.' });

  db.acessos.unshift({ id: Date.now(), usuario_id: u.id, cpf: cpfLimpo, tipo: 'login', feito_em: new Date().toISOString() });
  saveDB(db);

  res.json({ ok: true, mensagem: 'Login realizado!', id: u.id });
};
