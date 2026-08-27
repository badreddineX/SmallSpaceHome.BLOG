import nodemailer from 'nodemailer';

// Transactional send only (confirm / welcome / unsubscribe receipts) via the
// Hostinger mailbox over SMTP. The weekly broadcast does NOT go through here —
// that's Phase 2 (Resend / SES). Hostinger caps bulk sending and disallows it.
let _transport;

function transport() {
  if (!_transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    _transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port,
      secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transport;
}

/**
 * @param {{ to: string, subject: string, html: string, text: string,
 *           listUnsubscribe?: string }} msg
 */
export async function sendMail(msg) {
  const headers = {};
  if (msg.listUnsubscribe) {
    // RFC 2369 + RFC 8058 one-click unsubscribe.
    headers['List-Unsubscribe'] = `<${msg.listUnsubscribe}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }
  return transport().sendMail({
    from: process.env.NEWSLETTER_FROM || 'SmallSpace Home <newsletter@smallspacehome.ca>',
    replyTo: process.env.NEWSLETTER_REPLY_TO || undefined,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    headers,
  });
}
