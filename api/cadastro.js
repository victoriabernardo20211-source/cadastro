const { getSQL, hash } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ erro: 'Método não permitido.' });

  const { cpf, senha, pin } = req.body || {};
  if (!cpf || !senha || !pin) return res.status(400).json({ erro: 'Preencha todos os campos.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return res.status(400).json({ erro: 'CPF inválido.' });
  if (!/^\d{8}$/.test(senha)) return res.status(400).json({ erro: 'Senha deve ter exatamente 8 dígitos.' });
  if (!/^\d{4}$/.test(pin))   return res.status(400).json({ erro: 'PIN deve ter exatamente 4 dígitos.' });

  try {
    const sql = getSQL();

    // cria tabela se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id        SERIAL PRIMARY KEY,
        cpf       TEXT UNIQUE NOT NULL,
        senha     TEXT NOT NULL,
        pin       TEXT NOT NULL,
        criado_em TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const existe = await sql`SELECT id FROM usuarios WHERE cpf = ${cpfLimpo}`;
    if (existe.length > 0) return res.status(409).json({ erro: 'CPF já cadastrado.' });

    const rows = await sql`
      INSERT INTO usuarios (cpf, senha, pin)
      VALUES (${cpfLimpo}, ${hash(senha)}, ${hash(pin)})
      RETURNING id
    `;

    res.json({ ok: true, mensagem: 'Cadastro realizado!', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
