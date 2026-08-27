// Shared helpers for the newsletter API routes.

/** RFC-5322-lite check — good enough to reject typos and junk, not a spec parser. */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const e = email.trim();
  if (e.length < 5 || e.length > 254) return false;
  return /^[^\s@"']+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function normalizeEmail(email) {
  return String(email == null ? '' : email).trim().toLowerCase();
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

/** A 64-char lowercase-hex token is the only shape our confirm/unsub routes accept. */
export function isValidToken(t) {
  return typeof t === 'string' && /^[a-f0-9]{64}$/.test(t);
}

/** Minimal standalone HTML page for the confirm / unsubscribe landing views. */
export function statusPage(res, status, heading, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(heading)} — SmallSpace Home</title>
<style>
  body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#FAFAF7;color:#292524;
       line-height:1.7;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{max-width:460px;text-align:center}
  .mark{display:inline-flex;width:56px;height:56px;border-radius:50%;background:#F3EFE9;border:1.5px solid #E5DDD3;
        align-items:center;justify-content:center;font-size:1.5rem;color:#4F7249;margin-bottom:20px}
  h1{font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;margin:0 0 12px;color:#1C1917}
  p{color:#78716C;font-size:.95rem;margin:0 0 24px}
  a{display:inline-block;padding:12px 26px;background:#1C1917;color:#fff;text-decoration:none;
    font-size:.7rem;letter-spacing:.16em;text-transform:uppercase}
</style></head>
<body><div class="card">
  <span class="mark">✓</span>
  <h1>${escapeHtml(heading)}</h1>
  <p>${body}</p>
  <a href="https://smallspacehome.ca/">Back to SmallSpace Home</a>
</div></body></html>`);
}
