/**
 * Netlify Function — /api/orders
 * Handles GET (list all orders) and POST (add new / update existing)
 * Storage: JSONBin.io (free JSON database)
 *
 * Required env vars (set in Netlify dashboard → Site Settings → Environment):
 *   JSONBIN_KEY      → your JSONBin master key  (starts with $2b$...)
 *   ORDERS_BIN_ID    → the bin ID for orders     (24-char hex string)
 */

const BIN_URL = `https://api.jsonbin.io/v3/b/${process.env.ORDERS_BIN_ID}`;
const API_KEY  = process.env.JSONBIN_KEY;

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/* ── helpers ── */
async function readOrders() {
  const res  = await fetch(`${BIN_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (Array.isArray(data.record) ? data.record : []);
}

async function writeOrders(orders) {
  const res = await fetch(BIN_URL, {
    method : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY,
    },
    body: JSON.stringify(orders),
  });
  if (!res.ok) throw new Error(`JSONBin write failed: ${res.status}`);
}

/* ── handler ── */
exports.handler = async (event) => {
  /* CORS preflight */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const headers = { 'Content-Type': 'application/json', ...CORS };

  try {
    /* GET — return all orders */
    if (event.httpMethod === 'GET') {
      const orders = await readOrders();
      return { statusCode: 200, headers, body: JSON.stringify(orders) };
    }

    /* POST — add new order OR update existing order */
    if (event.httpMethod === 'POST') {
      const incoming = JSON.parse(event.body || '{}');
      if (!incoming.id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing id' }) };
      }

      const orders = await readOrders();
      const idx    = orders.findIndex(o => o.id === incoming.id);

      if (idx === -1) {
        /* New order — prepend so newest appears first */
        orders.unshift(incoming);
      } else {
        /* Existing order — merge (preserves screenshotData etc.) */
        orders[idx] = { ...orders[idx], ...incoming };
      }

      await writeOrders(orders);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method not allowed' }) };

  } catch (err) {
    console.error('[orders fn]', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
