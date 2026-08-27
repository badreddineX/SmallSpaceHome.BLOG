// Plain, single-column HTML emails. No external images or CSS — keeps them out
// of spam folders and rendering the same everywhere.

const BRAND = 'SmallSpace Home';
const SITE = 'https://smallspacehome.ca';

// A physical mailing address in the footer is a CASL / CAN-SPAM requirement for
// bulk mail. Optional here: if MAILING_ADDRESS is set it's shown, otherwise the
// footer just carries sender identification. Set it before the list scales.
const MAILING_ADDRESS = process.env.MAILING_ADDRESS || '';

function shell(bodyHtml, { unsubUrl } = {}) {
  const senderLine = MAILING_ADDRESS ? `${BRAND} · ${MAILING_ADDRESS}` : `${BRAND} · smallspacehome.ca`;
  return `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#292524;line-height:1.65">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E5DDD3">
        <tr><td style="padding:32px 36px">
          <p style="margin:0 0 24px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8B6F47;font-weight:600">${BRAND}</p>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #EDE8E3;font-size:12px;color:#8a8078">
          <p style="margin:0 0 6px">${senderLine}</p>
          <p style="margin:0">
            ${unsubUrl
              ? `You're receiving this because you confirmed your subscription at <a href="${SITE}" style="color:#8B6F47">smallspacehome.ca</a>. <a href="${unsubUrl}" style="color:#8B6F47">Unsubscribe</a>.`
              : `Sent by ${BRAND} · <a href="${SITE}" style="color:#8B6F47">smallspacehome.ca</a>`}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function confirmEmail({ confirmUrl }) {
  const subject = `Confirm your ${BRAND} subscription`;
  const html = shell(`
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1C1917">One quick step</h1>
    <p style="margin:0 0 16px;font-size:15px">Tap the button below to confirm you want the weekly ${BRAND} email — one renter-friendly small-space idea every week, with real CAD prices.</p>
    <p style="margin:0 0 24px">
      <a href="${confirmUrl}" style="display:inline-block;background:#1C1917;color:#ffffff;text-decoration:none;padding:13px 28px;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Confirm subscription</a>
    </p>
    <p style="margin:0;font-size:13px;color:#8a8078">If the button doesn't work, paste this link into your browser:<br>
      <a href="${confirmUrl}" style="color:#8B6F47;word-break:break-all">${confirmUrl}</a></p>
    <p style="margin:16px 0 0;font-size:13px;color:#8a8078">Didn't sign up? Just ignore this email — no subscription is created until you confirm.</p>
  `);
  const text = [
    `Confirm your ${BRAND} subscription`,
    ``,
    `Tap to confirm you want the weekly ${BRAND} email:`,
    confirmUrl,
    ``,
    `Didn't sign up? Ignore this email — nothing happens until you confirm.`,
  ].join('\n');
  return { subject, html, text };
}

export function welcomeEmail({ unsubUrl }) {
  const subject = `You're in — welcome to ${BRAND}`;
  const html = shell(`
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1C1917">You're on the list</h1>
    <p style="margin:0 0 16px;font-size:15px">Thanks for confirming. Every week you'll get one small, doable idea for making a small Canadian apartment work better — no drilling, real prices, no spam.</p>
    <p style="margin:0 0 16px;font-size:15px">While you wait for the first issue, a few reader favourites:</p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:15px">
      <li style="margin-bottom:6px"><a href="${SITE}/blog/storage-ideas-for-small-places" style="color:#8B6F47">No-drill storage ideas for small places</a></li>
      <li style="margin-bottom:6px"><a href="${SITE}/blog/small-space-living-room-ideas" style="color:#8B6F47">Small-space living room ideas</a></li>
      <li style="margin-bottom:6px"><a href="${SITE}/blog/small-space-furniture" style="color:#8B6F47">Furniture that earns its footprint</a></li>
    </ul>
    <p style="margin:0;font-size:15px">— Badreddine, ${BRAND}</p>
  `, { unsubUrl });
  const text = [
    `You're on the list — welcome to ${BRAND}.`,
    ``,
    `Every week: one small, doable idea for a small Canadian apartment. Real prices, no spam.`,
    ``,
    `Reader favourites:`,
    `- ${SITE}/blog/storage-ideas-for-small-places`,
    `- ${SITE}/blog/small-space-living-room-ideas`,
    `- ${SITE}/blog/small-space-furniture`,
    ``,
    `Unsubscribe anytime: ${unsubUrl}`,
  ].join('\n');
  return { subject, html, text, listUnsubscribe: unsubUrl };
}
