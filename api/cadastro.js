const { loadDB, saveDB, hash } = require('./_db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ erro: 'Método não permitido.' });

  const { cpf, senha, pin } = req.body || {};

  if (!cpf || !senha || !pin)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11)  return res.status(400).json({ erro: 'CPF inválido.' });
  if (senha.length < 6)        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 dígitos.' });
  if (!/^\d{4}$/.test(pin))    return res.status(400).json({ erro: 'PIN deve ter 4 dígitos numéricos.' });

  const db = loadDB();

  if (db.usuarios.find(u => u.cpf === cpfLimpo))
    return res.status(409).json({ erro: 'CPF já cadastrado.' });

  const novo = {
    id: Date.now(),
    cpf: cpfLimpo,
    senha: hash(senha),
    pin:   hash(pin),
    criado_em: new Date().toISOString()
  };
  db.usuarios.push(novo);
  db.acessos.unshift({ id: Date.now(), usuario_id: novo.id, cpf: cpfLimpo, tipo: 'cadastro', feito_em: new Date().toISOString() });
  saveDB(db);

  res.json({ ok: true, mensagem: 'Cadastro realizado com sucesso!', id: novo.id });
};
