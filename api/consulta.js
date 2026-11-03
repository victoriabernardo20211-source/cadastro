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

    if (!r.ok) return res.status(r.status).json({ erro: 'Erro na consulta SNOP.', detalhe: text.slice(0, 200) });

    // A API SNOP pode retornar os dados em diferentes níveis
    const d = data?.data || data?.resultado || data?.response || data || {};

    const nome       = d.nome       || d.name         || d.NOME        || d.NM_PESSOA    || '—';
    const nascimento = d.nascimento || d.data_nasc     || d.DT_NASC     || d.birthdate    ||
                       d.dt_nascimento || d.DATA_NASCIMENTO               || '—';
    const mae        = d.mae        || d.nome_mae      || d.NM_MAE      || d.mother       ||
                       d.NOME_MAE   || d.nm_mae                          || '—';

    res.json({ ok: true, nome, nascimento, mae });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
