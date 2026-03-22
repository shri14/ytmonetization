/**
 * Vercel Serverless Function — /api/orders
 * GET  → return all orders
 * POST → add new / update existing order
 * Storage: JSONBin.io
 *
 * Env vars needed in Vercel dashboard:
 *   JSONBIN_KEY      → your JSONBin master key
 *   ORDERS_BIN_ID    → bin ID for orders
 */

const BIN_URL = `https://api.jsonbin.io/v3/b/${process.env.ORDERS_BIN_ID}`;
const API_KEY  = process.env.JSONBIN_KEY;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
}

async function readOrders() {
  const r = await fetch(`${BIN_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : (Array.isArray(data.record) ? data.record : []);
}

async function writeOrders(orders) {
  const r = await fetch(BIN_URL, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body   : JSON.stringify(orders),
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
      const orders = await readOrders();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const incoming = req.body;
      if (!incoming || !incoming.id) {
        return res.status(400).json({ error: 'missing id' });
      }

      const orders = await readOrders();
      const idx = orders.findIndex(o => o.id === incoming.id);

      if (idx === -1) {
        orders.unshift(incoming);
      } else {
        orders[idx] = { ...orders[idx], ...incoming };
      }

      await writeOrders(orders);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await writeOrders([]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });

  } catch (err) {
    console.error('[orders fn]', err);
    return res.status(500).json({ error: err.message });
  }
};
