/**
 * Netlify Function — /api/plans
 * GET  → return all plans
 * POST → save all plans (full replace)
 * Storage: JSONBin.io
 *
 * Env vars needed in Netlify dashboard:
 *   JSONBIN_KEY    → your JSONBin master key
 *   PLANS_BIN_ID   → bin ID for plans (create a bin with [] content)
 */

const BIN_URL = `https://api.jsonbin.io/v3/b/${process.env.PLANS_BIN_ID}`;
const API_KEY  = process.env.JSONBIN_KEY;

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function readPlans() {
  const res = await fetch(`${BIN_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) ? data : null;
}

async function writePlans(plans) {
  const res = await fetch(BIN_URL, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body   : JSON.stringify(plans),
  });
  if (!res.ok) throw new Error(`JSONBin write failed: ${res.status}`);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const headers = { 'Content-Type': 'application/json', ...CORS };

  try {
    if (event.httpMethod === 'GET') {
      const plans = await readPlans();
      if (!plans) return { statusCode: 200, headers, body: JSON.stringify([]) };
      return { statusCode: 200, headers, body: JSON.stringify(plans) };
    }

    if (event.httpMethod === 'POST') {
      const incoming = JSON.parse(event.body || '[]');
      if (!Array.isArray(incoming)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'expected array' }) };
      }
      await writePlans(incoming);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) };

  } catch (err) {
    console.error('[plans fn]', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
