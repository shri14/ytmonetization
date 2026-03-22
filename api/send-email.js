/**
 * Vercel Serverless Function — /api/send-email
 * POST → send email via Resend
 *
 * Env vars needed:
 *   RESEND_API_KEY → your Resend API key
 *
 * Body: { type, order }
 * Types:
 *   new_order      → user confirmation + admin alert
 *   order_complete → user completion email
 *   order_cancel   → user cancellation email
 */

const RESEND_URL  = 'https://api.resend.com/emails';
const FROM        = 'YT Monetization <onboarding@resend.dev>';   // swap with noreply@ytmonetization.com after domain verified
const ADMIN_EMAIL = 'sales@ytmonetization.com';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

async function sendMail({ to, subject, html }) {
  const r = await fetch(RESEND_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Resend error: ${r.status} ${txt}`);
  }
  return r.json();
}

/* ── EMAIL TEMPLATES ── */

function templateUserConfirm(o) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:2rem 1rem;color:#1e293b}
  .wrap{max-width:520px;margin:0 auto}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#FF416C,#FF4B2B);padding:2rem;text-align:center;color:#fff}
  .hdr-icon{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.75rem}
  .hdr h1{font-size:1.4rem;font-weight:800;margin-bottom:.25rem}
  .hdr p{font-size:.875rem;opacity:.85}
  .body{padding:1.75rem}
  .section{margin-bottom:1.25rem}
  .section-title{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:.6rem}
  .row{display:flex;justify-content:space-between;align-items:center;padding:.55rem 0;border-bottom:1px solid #f1f5f9;font-size:.875rem}
  .row:last-child{border-bottom:none}
  .rk{color:#64748b;font-weight:500}
  .rv{font-weight:600;text-align:right}
  .rv-green{color:#10b981;font-weight:700;font-size:1rem}
  .utr-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:.75rem 1rem;margin:.75rem 0;font-family:monospace;font-size:.9rem;font-weight:700;color:#0f172a;text-align:center;letter-spacing:.04em}
  .next{background:#f8fafc;border-radius:10px;padding:1rem;margin:1.25rem 0}
  .next-title{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:.6rem}
  .next-item{display:flex;gap:.6rem;align-items:flex-start;font-size:.82rem;color:#475569;margin-bottom:.4rem}
  .next-item:last-child{margin-bottom:0}
  .dot{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#FF416C,#FF4B2B);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800;flex-shrink:0;margin-top:1px}
  .footer{text-align:center;padding:1.25rem;background:#f8fafc;font-size:.75rem;color:#94a3b8;border-top:1px solid #e2e8f0}
  .brand{font-weight:800;color:#FF416C}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hdr">
      <div class="hdr-icon">✅</div>
      <h1>Order Confirmed!</h1>
      <p>Reference: <strong>#${o.id}</strong></p>
    </div>
    <div class="body">
      <p style="font-size:.9rem;color:#475569;margin-bottom:1.25rem">Hi there! Your order has been received and is being processed. Here's a summary:</p>

      <div class="section">
        <div class="section-title">Plan Details</div>
        <div class="row"><span class="rk">Plan</span><span class="rv">${o.plan}</span></div>
        <div class="row"><span class="rk">Platform</span><span class="rv">${o.platform}</span></div>
        ${o.service ? `<div class="row"><span class="rk">Service</span><span class="rv">${o.service}</span></div>` : ''}
        <div class="row"><span class="rk">Amount</span><span class="rv rv-green">₹${parseInt(o.price).toLocaleString('en-IN')}</span></div>
        <div class="row"><span class="rk">Start Time</span><span class="rv">${o.start || '—'}</span></div>
        <div class="row"><span class="rk">Delivery</span><span class="rv">${o.delivery || '—'}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Transaction ID</div>
        <div class="utr-box">${o.utrId || '—'}</div>
      </div>

      <div class="next">
        <div class="next-title">What happens next?</div>
        <div class="next-item"><div class="dot">1</div><span>Our team verifies your payment (usually within ${o.start || '5 mins'})</span></div>
        <div class="next-item"><div class="dot">2</div><span>We start processing your order immediately after verification</span></div>
        <div class="next-item"><div class="dot">3</div><span>You'll receive a completion email once your order is done (within ${o.delivery || '24 hours'})</span></div>
      </div>

      <p style="font-size:.82rem;color:#64748b">Need help? Reply to this email or contact us at <strong>sales@ytmonetization.com</strong></p>
    </div>
    <div class="footer">
      <span class="brand">YT Monetization</span> · Your trusted social media growth partner<br/>
      <span style="font-size:.7rem">© ${new Date().getFullYear()} YT Monetization. All rights reserved.</span>
    </div>
  </div>
</div>
</body></html>`;
}

function templateAdminAlert(o) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:2rem 1rem;color:#1e293b}
  .wrap{max-width:520px;margin:0 auto}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:#0f172a;padding:1.5rem;display:flex;align-items:center;gap:1rem;color:#fff}
  .hdr-icon{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#FF416C,#FF4B2B);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
  .hdr-text h1{font-size:1.1rem;font-weight:800}
  .hdr-text p{font-size:.8rem;color:#94a3b8;margin-top:.15rem}
  .body{padding:1.5rem}
  .section{margin-bottom:1.1rem}
  .section-title{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:.5rem;padding-bottom:.4rem;border-bottom:1px solid #f1f5f9}
  .row{display:flex;justify-content:space-between;padding:.45rem 0;font-size:.85rem;border-bottom:1px solid #f8fafc}
  .row:last-child{border-bottom:none}
  .rk{color:#64748b}
  .rv{font-weight:600;text-align:right;word-break:break-all;max-width:60%}
  .rv-green{color:#10b981;font-weight:700}
  .utr{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:.5rem .75rem;font-family:monospace;font-weight:700;color:#065f46;font-size:.85rem}
  .pending-badge{display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:100px;padding:.2rem .75rem;font-size:.72rem;font-weight:700}
  .action-btn{display:block;text-align:center;background:linear-gradient(135deg,#FF416C,#FF4B2B);color:#fff;text-decoration:none;border-radius:10px;padding:.85rem;font-weight:700;font-size:.9rem;margin-top:1.25rem}
  .footer{text-align:center;padding:1rem;background:#f8fafc;font-size:.72rem;color:#94a3b8;border-top:1px solid #e2e8f0}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hdr">
      <div class="hdr-icon">🛒</div>
      <div class="hdr-text">
        <h1>New Order Received!</h1>
        <p>#${o.id} · <span class="pending-badge">Pending</span></p>
      </div>
    </div>
    <div class="body">
      <div class="section">
        <div class="section-title">Order Info</div>
        <div class="row"><span class="rk">Reference</span><span class="rv">#${o.id}</span></div>
        <div class="row"><span class="rk">Date</span><span class="rv">${new Date(o.date).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true})}</span></div>
        <div class="row"><span class="rk">Amount</span><span class="rv rv-green">₹${parseInt(o.price).toLocaleString('en-IN')}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Plan Details</div>
        <div class="row"><span class="rk">Plan</span><span class="rv">${o.plan}</span></div>
        <div class="row"><span class="rk">Platform</span><span class="rv">${o.platform}</span></div>
        ${o.service ? `<div class="row"><span class="rk">Service</span><span class="rv">${o.service}</span></div>` : ''}
        <div class="row"><span class="rk">Start Time</span><span class="rv">${o.start || '—'}</span></div>
        <div class="row"><span class="rk">Delivery</span><span class="rv">${o.delivery || '—'}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Customer Details</div>
        <div class="row"><span class="rk">Profile Link</span><span class="rv"><a href="${o.profileLink}" style="color:#3b82f6">${o.profileLink}</a></span></div>
        ${o.mobile ? `<div class="row"><span class="rk">Mobile</span><span class="rv">${o.mobile}</span></div>` : ''}
        ${o.email ? `<div class="row"><span class="rk">Email</span><span class="rv">${o.email}</span></div>` : ''}
        ${o.message ? `<div class="row"><span class="rk">Note</span><span class="rv">${o.message}</span></div>` : ''}
      </div>
      <div class="section">
        <div class="section-title">Transaction ID</div>
        <div class="utr">${o.utrId || '—'}</div>
      </div>
      <a href="https://ytmonetization.vercel.app/admin.html" class="action-btn">Open Admin Panel →</a>
    </div>
    <div class="footer">YT Monetization Admin Alert · Do not reply to this email</div>
  </div>
</div>
</body></html>`;
}

function templateUserComplete(o) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:2rem 1rem;color:#1e293b}
  .wrap{max-width:520px;margin:0 auto}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:linear-gradient(135deg,#10b981,#059669);padding:2rem;text-align:center;color:#fff}
  .hdr-icon{font-size:3rem;margin-bottom:.75rem}
  .hdr h1{font-size:1.4rem;font-weight:800;margin-bottom:.25rem}
  .hdr p{font-size:.875rem;opacity:.85}
  .body{padding:1.75rem;text-align:center}
  .msg{font-size:.95rem;color:#475569;line-height:1.6;margin-bottom:1.5rem}
  .ref{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:1rem;margin-bottom:1.5rem}
  .ref-label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6ee7b7;margin-bottom:.25rem}
  .ref-val{font-size:1.1rem;font-weight:800;color:#065f46}
  .detail{background:#f8fafc;border-radius:10px;padding:1rem;text-align:left;margin-bottom:1.25rem}
  .row{display:flex;justify-content:space-between;padding:.4rem 0;font-size:.85rem;border-bottom:1px solid #f1f5f9}
  .row:last-child{border-bottom:none}
  .rk{color:#64748b}
  .rv{font-weight:600}
  .footer{text-align:center;padding:1.25rem;background:#f8fafc;font-size:.75rem;color:#94a3b8;border-top:1px solid #e2e8f0}
  .brand{font-weight:800;color:#10b981}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hdr">
      <div class="hdr-icon">🎉</div>
      <h1>Order Completed!</h1>
      <p>Your order has been successfully delivered</p>
    </div>
    <div class="body">
      <p class="msg">Great news! Your order <strong>#${o.id}</strong> has been completed. We hope you're happy with the results!</p>
      <div class="ref">
        <div class="ref-label">Order Reference</div>
        <div class="ref-val">#${o.id}</div>
      </div>
      <div class="detail">
        <div class="row"><span class="rk">Plan</span><span class="rv">${o.plan}</span></div>
        <div class="row"><span class="rk">Platform</span><span class="rv">${o.platform}</span></div>
        ${o.service ? `<div class="row"><span class="rk">Service</span><span class="rv">${o.service}</span></div>` : ''}
        <div class="row"><span class="rk">Amount Paid</span><span class="rv">₹${parseInt(o.price).toLocaleString('en-IN')}</span></div>
      </div>
      <p style="font-size:.82rem;color:#64748b">Thank you for choosing YT Monetization! 🙏<br/>For any questions, contact us at <strong>sales@ytmonetization.com</strong></p>
    </div>
    <div class="footer">
      <span class="brand">YT Monetization</span> · Your trusted social media growth partner<br/>
      <span style="font-size:.7rem">© ${new Date().getFullYear()} YT Monetization. All rights reserved.</span>
    </div>
  </div>
</div>
</body></html>`;
}

function templateUserCancel(o) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:2rem 1rem;color:#1e293b}
  .wrap{max-width:520px;margin:0 auto}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:#64748b;padding:2rem;text-align:center;color:#fff}
  .hdr-icon{font-size:2.5rem;margin-bottom:.75rem}
  .hdr h1{font-size:1.3rem;font-weight:800;margin-bottom:.25rem}
  .body{padding:1.75rem;text-align:center}
  .msg{font-size:.9rem;color:#475569;line-height:1.6;margin-bottom:1.25rem}
  .footer{text-align:center;padding:1rem;background:#f8fafc;font-size:.75rem;color:#94a3b8;border-top:1px solid #e2e8f0}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hdr">
      <div class="hdr-icon">❌</div>
      <h1>Order Cancelled</h1>
    </div>
    <div class="body">
      <p class="msg">Your order <strong>#${o.id}</strong> for <strong>${o.plan} (${o.platform})</strong> has been cancelled.<br/><br/>
      If you were charged, a refund will be processed within 3–5 business days.<br/><br/>
      For any questions, contact us at <strong>sales@ytmonetization.com</strong></p>
    </div>
    <div class="footer">YT Monetization · © ${new Date().getFullYear()}</div>
  </div>
</div>
</body></html>`;
}

/* ── HANDLER ── */
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  try {
    const { type, order: o } = req.body;
    if (!type || !o) return res.status(400).json({ error: 'missing type or order' });

    if (type === 'new_order') {
      const promises = [];
      /* User confirmation */
      if (o.email) {
        promises.push(sendMail({
          to:      o.email,
          subject: `✅ Order Confirmed #${o.id} — YT Monetization`,
          html:    templateUserConfirm(o),
        }));
      }
      /* Admin alert */
      promises.push(sendMail({
        to:      ADMIN_EMAIL,
        subject: `🛒 New Order #${o.id} — ${o.plan} (${o.platform}) ₹${o.price}`,
        html:    templateAdminAlert(o),
      }));
      await Promise.all(promises);
    }

    else if (type === 'order_complete') {
      if (!o.email) return res.status(200).json({ ok: true, skipped: 'no email' });
      await sendMail({
        to:      o.email,
        subject: `🎉 Your Order is Complete! #${o.id} — YT Monetization`,
        html:    templateUserComplete(o),
      });
    }

    else if (type === 'order_cancel') {
      if (!o.email) return res.status(200).json({ ok: true, skipped: 'no email' });
      await sendMail({
        to:      o.email,
        subject: `Order Cancelled #${o.id} — YT Monetization`,
        html:    templateUserCancel(o),
      });
    }

    else {
      return res.status(400).json({ error: 'unknown type' });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[send-email]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
