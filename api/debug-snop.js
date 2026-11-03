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
  const cpf = (req.query.cpf || '11144477735').replace(/\D/g, '');
  const SNOP_KEY = process.env.SNOP_KEY;
  if (!SNOP_KEY) return res.json({ erro: 'SNOP_KEY não configurada' });

  try {
    const { status, text } = await httpsGet(
      `https://snoopintelligence.cloud/api/v2/generic/cpf?cpf=${cpf}`,
      { Authorization: `Bearer ${SNOP_KEY}`, Accept: 'application/json' }
    );
    res.json({ status, body: text.slice(0, 2000) });
  } catch (err) {
    res.json({ erro: err.message });
  }
};
