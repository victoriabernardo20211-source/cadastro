const fetch = require('node-fetch');

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
  if (!SNOP_KEY) return res.status(500).json({ erro: 'SNOP_KEY não configurada.' });

  try {
    const r = await fetch(
      `https://snoopintelligence.cloud/api/v2/generic/cpf?cpf=${cpfLimpo}`,
      {
        headers: {
          Authorization: `Bearer ${SNOP_KEY}`,
          Accept: 'application/json'
        }
      }
    );

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!r.ok) return res.status(200).json({ ok: false, erro: `SNOP status ${r.status}`, detalhe: text.slice(0, 300) });

    // A API SNOP pode retornar os dados em diferentes níveis
    // SNOP retorna { statusCode: 200, body: { cpf, name, birth_date, mother_name, ... } }
    const d = data?.body || data || {};

    const nome       = d.name        || d.nome        || '—';
    const nascimento = d.birth_date  || d.nascimento  || '—';
    const mae        = d.mother_name || d.mae         || '—';

    res.json({ ok: true, nome, nascimento, mae });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
