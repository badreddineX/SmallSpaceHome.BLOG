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

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]
  );
}

// Tiny inline-markdown → HTML for the weekly-idea body (**bold**, [text](url),
// blank-line paragraphs). Not a full parser — the idea files stay simple.
function ideaBodyHtml(raw) {
  return String(raw || '')
    .trim()
    .split(/\n{2,}/)
    .map((para) => {
      const inner = esc(para.replace(/\s*\n\s*/g, ' '))
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#8B6F47">$1</a>');
      return `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#292524">${inner}</p>`;
    })
    .join('\n');
}

/**
 * The weekly email. Leads with the curated "idea of the week"; any new posts
 * published since the last send follow as a secondary section. Send when there
 * is an idea OR new posts (broadcast.js decides).
 * @param {{ idea?: object|null, posts?: Array, unsubUrl: string }} opts
 */
export function digestEmail({ idea = null, posts = [], unsubUrl }) {
  const subject = idea
    ? `${idea.title} — ${BRAND}`
    : posts.length === 1
      ? `New on ${BRAND}: ${posts[0].title}`
      : `${posts.length} new small-space guides on ${BRAND}`;

  const ideaBlock = idea
    ? `
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8B6F47;font-weight:700">The idea this week</p>
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#1C1917">${esc(idea.title)}${idea.price ? ` <span style="font-family:-apple-system,sans-serif;font-size:12px;font-weight:600;color:#8B6F47;letter-spacing:.04em;white-space:nowrap">· ${esc(idea.price)}</span>` : ''}</h1>
    ${idea.image ? `<img src="${esc(idea.image)}" alt="" width="448" style="width:100%;max-width:448px;height:auto;border:1px solid #E5DDD3;display:block;margin:0 0 16px">` : ''}
    ${ideaBodyHtml(idea.body)}
    ${idea.relatedUrl ? `<p style="margin:14px 0 0"><a href="${esc(idea.relatedUrl)}" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8B6F47;text-decoration:none">The full guide →</a></p>` : ''}
  `
    : '';

  const postCards = posts
    .map(
      (p) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td>
        ${p.image ? `<a href="${esc(p.url)}"><img src="${esc(p.image)}" alt="" width="448" style="width:100%;max-width:448px;height:auto;border:1px solid #E5DDD3;display:block;margin:0 0 12px"></a>` : ''}
        ${p.category ? `<p style="margin:0 0 4px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B6F47">${esc(p.category)}</p>` : ''}
        <a href="${esc(p.url)}" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#1C1917;text-decoration:none;font-weight:bold">${esc(p.title)}</a>
        <p style="margin:6px 0 8px;font-size:14px;color:#57534E">${esc(p.description)}</p>
        <a href="${esc(p.url)}" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8B6F47;text-decoration:none">Read it →</a>
      </td></tr>
    </table>`
    )
    .join('\n');

  const postsBlock = posts.length
    ? `
    ${idea ? '<div style="border-top:1px solid #EDE8E3;margin:28px 0 24px"></div>' : ''}
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8B6F47;font-weight:700">${idea ? 'Also new this week' : 'New this week'}</p>
    ${!idea ? `<p style="margin:0 0 20px;font-size:14px;color:#8a8078">Fresh ${posts.length === 1 ? 'guide' : 'guides'} for small Canadian apartments — renter-friendly, real CAD prices.</p>` : '<div style="height:12px"></div>'}
    ${postCards}
  `
    : '';

  const html = shell(
    `${ideaBlock}${postsBlock}
    <p style="margin:24px 0 0;font-size:14px">Browse everything at <a href="${SITE}/blog" style="color:#8B6F47">smallspacehome.ca/blog</a>.</p>`,
    { unsubUrl }
  );

  const text = [
    idea ? `THE IDEA THIS WEEK: ${idea.title}${idea.price ? ` (${idea.price})` : ''}` : '',
    idea ? '' : null,
    idea ? String(idea.body || '').trim() : null,
    idea && idea.relatedUrl ? `\nFull guide: ${idea.relatedUrl}` : null,
    posts.length ? `\n${idea ? 'ALSO NEW THIS WEEK' : 'NEW THIS WEEK'}:` : null,
    ...posts.map((p) => `• ${p.title}\n  ${p.url}`),
    '',
    `Browse everything: ${SITE}/blog`,
    `Unsubscribe: ${unsubUrl}`,
  ]
    .filter((l) => l !== null)
    .join('\n');

  return { subject, html, text, listUnsubscribe: unsubUrl };
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
