import { sql } from './_lib/db.js';
import { sendMail } from './_lib/mail.js';
import { welcomeEmail } from './_lib/templates.js';
import { isValidToken, statusPage } from './_lib/util.js';

const SITE_URL = process.env.SITE_URL || 'https://smallspacehome.ca';

export default async function handler(req, res) {
  const token = String((req.query && req.query.token) || '');

  if (!isValidToken(token)) {
    return statusPage(res, 400, 'Link not valid',
      'This confirmation link looks wrong or has expired. Try subscribing again from the site.');
  }

  try {
    // Only a 'pending' row flips to 'active' — that's the one, first confirmation.
    const confirmed = await sql`
      update subscribers
      set status = 'active', confirmed_at = now(), updated_at = now()
      where token = ${token} and status = 'pending'
      returning email
    `;

    if (confirmed.length) {
      try {
        const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${token}`;
        const { subject, html, text, listUnsubscribe } = welcomeEmail({ unsubUrl });
        await sendMail({ to: confirmed[0].email, subject, html, text, listUnsubscribe });
      } catch (e) {
        console.error('[newsletter] welcome email failed (non-fatal):', e);
      }
      return redirectDone(res);
    }

    // Not pending — either the link was already used (now 'active') or it's stale.
    const active = await sql`
      select 1 from subscribers where token = ${token} and status = 'active' limit 1
    `;
    if (active.length) return redirectDone(res);

    return statusPage(res, 404, 'Link no longer valid',
      'This link has already been used or was replaced by a newer one. Subscribe again if you still want in.');
  } catch (err) {
    console.error('[newsletter] confirm failed:', err);
    return statusPage(res, 500, 'Something went wrong',
      'We could not confirm your subscription right now. Please try the link again in a few minutes.');
  }
}

function redirectDone(res) {
  res.statusCode = 302;
  res.setHeader('Location', '/thank-you?src=newsletter');
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}
