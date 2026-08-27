import { randomBytes } from 'node:crypto';
import { sql } from './_lib/db.js';
import { sendMail } from './_lib/mail.js';
import { confirmEmail } from './_lib/templates.js';
import { isValidEmail, normalizeEmail, clientIp } from './_lib/util.js';

const SITE_URL = process.env.SITE_URL || 'https://smallspacehome.ca';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const wantsJson = String(req.headers.accept || '').includes('application/json');

  // Honeypot: real users never fill a hidden field. Pretend it worked.
  if (body.company) return done(res, wantsJson, 200, { ok: true, state: 'pending' });

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return done(res, wantsJson, 400, { ok: false, error: 'invalid_email' });
  }

  const source = (typeof body.source === 'string' ? body.source : 'site').slice(0, 60);

  try {
    const token = randomBytes(32).toString('hex');
    const ip = clientIp(req);
    const ua = String(req.headers['user-agent'] || '').slice(0, 400);

    // One row per email. Re-subscribing after unsubscribe issues a fresh token
    // and puts them back to 'pending' (needs a new confirm click). A repeat
    // submit while already 'pending' keeps the original token so the first
    // confirm email still works.
    const rows = await sql`
      insert into subscribers (email, status, token, source, consent_ip, consent_ua)
      values (${email}, 'pending', ${token}, ${source}, ${ip}, ${ua})
      on conflict (email) do update set
        status     = case when subscribers.status = 'unsubscribed' then 'pending' else subscribers.status end,
        token      = case when subscribers.status = 'unsubscribed' then ${token} else subscribers.token end,
        source     = excluded.source,
        consent_ip = excluded.consent_ip,
        consent_ua = excluded.consent_ua,
        updated_at = now()
      returning status, token
    `;
    const sub = rows[0];

    if (sub.status === 'active') {
      return done(res, wantsJson, 200, { ok: true, state: 'already_subscribed' });
    }

    const confirmUrl = `${SITE_URL}/api/confirm?token=${sub.token}`;
    const { subject, html, text } = confirmEmail({ confirmUrl });
    await sendMail({ to: email, subject, html, text });

    return done(res, wantsJson, 200, { ok: true, state: 'pending' });
  } catch (err) {
    console.error('[newsletter] subscribe failed:', err);
    return done(res, wantsJson, 500, { ok: false, error: 'server_error' });
  }
}

function done(res, wantsJson, status, payload) {
  if (wantsJson) return res.status(status).json(payload);
  // No-JS <form> fallback: bounce back to the newsletter page with a state flag.
  const state = payload.ok ? payload.state || 'pending' : payload.error || 'error';
  res.statusCode = 303;
  res.setHeader('Location', `/newsletter?state=${encodeURIComponent(state)}`);
  return res.end();
}
