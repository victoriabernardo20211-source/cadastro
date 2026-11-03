module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const cpf = (req.query.cpf || '11144477735').replace(/\D/g, '');
  const SNOP_KEY = process.env.SNOP_KEY;

  if (!SNOP_KEY) return res.json({ erro: 'SNOP_KEY não configurada' });

  try {
    const r = await fetch(
      `https://snoopintelligence.cloud/api/v2/generic/cpf?cpf=${cpf}`,
      { headers: { Authorization: `Bearer ${SNOP_KEY}`, Accept: 'application/json' } }
    );
    const text = await r.text();
    res.json({ status: r.status, body: text.slice(0, 2000) });
  } catch (err) {
    res.json({ erro: err.message });
  }
};
