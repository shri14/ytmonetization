/**
 * Vercel Serverless Function — /api/orders
 * GET    → return all orders (no screenshotData)
 * POST   → add new / update existing order (strips screenshotData before save)
 * DELETE → clear all orders
 * Storage: JSONBin.io
 *
 * Env vars needed in Vercel dashboard:
 *   JSONBIN_KEY      → your JSONBin master key
 *   ORDERS_BIN_ID    → bin ID for orders
 *
 * Screenshots are NEVER stored in JSONBin — they live in localStorage only.
 * This keeps the bin well under JSONBin's 100 KB free-tier limit and prevents
 * write failures that would break cross-device sync.
 */

const BIN_URL = `https://api.jsonbin.io/v3/b/${process.env.ORDERS_BIN_ID}`;
const API_KEY  = process.env.JSONBIN_KEY;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
}

/** Strip large base64 screenshot before writing to JSONBin */
function slim(order) {
  const { screenshotData, ...rest } = order;
  return rest;
}

async function readOrders() {
  const r = await fetch(`${BIN_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' },
  });
  if (!r.ok) return [];
  const data = await r.json();
  const arr = Array.isArray(data) ? data : (Array.isArray(data.record) ? data.record : []);
  // Filter out the _cleared sentinel used when orders are wiped
  return arr.filter(o => o && o.id);
}

async function writeOrders(orders) {
  // JSONBin rejects truly empty arrays — use a sentinel when clearing
  const payload = orders.length > 0 ? orders.map(slim) : [{ _cleared: true }];
  const r = await fetch(BIN_URL, {
    method : 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body   : JSON.stringify(payload),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`JSONBin write failed: ${r.status} ${txt}`);
  }
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
        orders.unshift(slim(incoming));
      } else {
        orders[idx] = { ...orders[idx], ...slim(incoming) };
      }

      await writeOrders(orders);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await writeOrders([]); // writeOrders handles empty → sentinel automatically
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });

  } catch (err) {
    console.error('[orders fn]', err);
    return res.status(500).json({ error: err.message });
  }
};
