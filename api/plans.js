/**
 * Vercel Serverless Function — /api/plans
 * GET  → return all plans
 * POST → save all plans (full replace)
 * Storage: JSONBin.io
 *
 * Env vars needed in Vercel dashboard:
 *   JSONBIN_KEY    → your JSONBin master key
 *   PLANS_BIN_ID   → bin ID for plans
 */

const BIN_URL = `https://api.jsonbin.io/v3/b/${process.env.PLANS_BIN_ID}`;
const API_KEY  = process.env.JSONBIN_KEY;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

async function readPlans() {
  const r = await fetch(`${BIN_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' },
  });
  if (!r.ok) return null;
  const data = await r.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.plans)) return data.plans;
  return null;
}

async function writePlans(plans) {
  const r = await fetch(BIN_URL, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body   : JSON.stringify(plans),
  });
  if (!r.ok) throw new Error(`JSONBin write failed: ${r.status}`);
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const plans = await readPlans();
      return res.status(200).json(plans || []);
    }

    if (req.method === 'POST') {
      const incoming = req.body;
      if (!Array.isArray(incoming)) {
        return res.status(400).json({ error: 'expected array' });
      }
      await writePlans(incoming);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });

  } catch (err) {
    console.error('[plans fn]', err);
    return res.status(500).json({ error: err.message });
  }
};
