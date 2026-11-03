const { dbGet, dbInsert, hash } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ erro: 'Método não permitido.' });

  const { cpf, senha, pin } = req.body || {};

  if (!cpf || !senha || !pin)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11)
    return res.status(400).json({ erro: 'CPF inválido.' });
  if (!/^\d{8}$/.test(senha))
    return res.status(400).json({ erro: 'Senha deve ter exatamente 8 dígitos numéricos.' });
  if (!/^\d{4}$/.test(pin))
    return res.status(400).json({ erro: 'PIN deve ter exatamente 4 dígitos numéricos.' });

  try {
    const jaExiste = await dbGet('usuarios', { cpf: cpfLimpo });
    if (jaExiste)
      return res.status(409).json({ erro: 'CPF já cadastrado.' });

    const novo = await dbInsert('usuarios', {
      cpf:   cpfLimpo,
      senha: hash(senha),
      pin:   hash(pin)
    });

    res.json({ ok: true, mensagem: 'Cadastro realizado com sucesso!', id: novo.id });
  } catch (err) {
    res.status(500).json({ erro: err.message || 'Erro interno.' });
  }
};
