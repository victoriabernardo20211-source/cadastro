const https = require('https');

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, text: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

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
    const { status, text } = await httpsGet(
      `https://snoopintelligence.cloud/api/v2/generic/cpf?cpf=${cpfLimpo}`,
      { Authorization: `Bearer ${SNOP_KEY}`, Accept: 'application/json' }
    );

    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (status !== 200) {
      return res.json({ ok: false, erro: `SNOP status ${status}`, detalhe: text.slice(0, 200) });
    }

    // estrutura: { statusCode: 200, body: { name, birth_date, mother_name, ... } }
    const d = data?.body || data || {};

    res.json({
      ok: true,
      nome:       d.name        || d.nome        || '—',
      nascimento: d.birth_date  || d.nascimento  || '—',
      mae:        d.mother_name || d.mae         || '—'
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
