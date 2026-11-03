module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { cpf } = req.query;
  if (!cpf) return res.status(400).json({ erro: 'CPF não informado.' });

  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return res.status(400).json({ erro: 'CPF inválido.' });

  const SNOP_KEY = process.env.SNOP_KEY;
  if (!SNOP_KEY) return res.status(500).json({ erro: 'Chave da API não configurada.' });

  try {
    const r = await fetch(
      `https://snoopintelligence.cloud/api/v2/generic/cpf?cpf=${cpfLimpo}`,
      { headers: { Authorization: `Bearer ${SNOP_KEY}` } }
    );

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ erro: 'Erro na consulta.', detalhe: txt });
    }

    const data = await r.json();

    // normaliza os campos mais comuns retornados por APIs de CPF
    const nome     = data.nome     || data.name        || data.NOME     || '—';
    const nascimento = data.nascimento || data.data_nascimento || data.NASCIMENTO || data.birthdate || '—';
    const mae      = data.mae      || data.nome_mae    || data.MAE      || data.mother_name || '—';

    res.json({ ok: true, nome, nascimento, mae, raw: data });
  } catch (err) {
    res.status(500).json({ erro: err.message || 'Erro interno.' });
  }
};
