// Bulk sender for the weekly digest — Resend HTTP API. Separate from the
// Hostinger SMTP transport in mail.js (which stays for confirm/welcome).
// Free tier: 3,000 emails/month, 100/day, ~2 requests/second.

const ENDPOINT = 'https://api.resend.com/emails/batch';
const BATCH = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {Array<{to:string, subject:string, html:string, text:string, listUnsubscribe?:string}>} messages
 * @returns {Promise<{sent:number, failed:number, errors:string[]}>}
 */
export async function sendBatch(messages) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_BULK_FROM || 'SmallSpace Home <hello@send.smallspacehome.ca>';
  const replyTo = process.env.NEWSLETTER_REPLY_TO || undefined;
  if (!key) throw new Error('RESEND_API_KEY is not set');

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < messages.length; i += BATCH) {
    const slice = messages.slice(i, i + BATCH);
    const payload = slice.map((m) => {
      const headers = {};
      if (m.listUnsubscribe) {
        headers['List-Unsubscribe'] = `<${m.listUnsubscribe}>`;
        headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
      }
      return {
        from,
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        reply_to: replyTo,
        headers,
      };
    });

    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        sent += slice.length;
      } else {
        failed += slice.length;
        errors.push(`batch ${i / BATCH}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
      }
    } catch (err) {
      failed += slice.length;
      errors.push(`batch ${i / BATCH}: ${err.message}`);
    }

    if (i + BATCH < messages.length) await sleep(600); // stay under the rate limit
  }

  return { sent, failed, errors };
}
