import { sql } from './_lib/db.js';
import { isValidToken, statusPage } from './_lib/util.js';

// GET  → person clicked the link in an email: show a confirmation page.
// POST → RFC 8058 one-click (mail client hits it automatically): 200, no body.
export default async function handler(req, res) {
  const token = String((req.query && req.query.token) || '');
  const isPost = req.method === 'POST';

  if (!isValidToken(token)) {
    if (isPost) { res.statusCode = 400; return res.end(); }
    return statusPage(res, 400, 'Link not valid', 'This unsubscribe link is not valid.');
  }

  try {
    await sql`
      update subscribers
      set status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
      where token = ${token} and status <> 'unsubscribed'
    `;

    if (isPost) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('unsubscribed');
    }
    return statusPage(res, 200, 'You’re unsubscribed',
      'You won’t receive any more emails from SmallSpace Home. Changed your mind? You can subscribe again anytime.');
  } catch (err) {
    console.error('[newsletter] unsubscribe failed:', err);
    if (isPost) { res.statusCode = 500; return res.end(); }
    return statusPage(res, 500, 'Something went wrong',
      'We could not process that right now. Email hello@smallspacehome.ca and we’ll remove you by hand.');
  }
}
