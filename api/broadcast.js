import { sql } from './_lib/db.js';
import { sendBatch } from './_lib/resend.js';
import { digestEmail } from './_lib/templates.js';

const SITE_URL = (process.env.SITE_URL || 'https://smallspacehome.ca').replace(/\/$/, '');
const MAX_POSTS_PER_DIGEST = 6;

// Weekly digest. Triggered by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer <CRON_SECRET>` automatically when CRON_SECRET is set;
// the same header lets you trigger it by hand for testing.
//   ?dryRun=1  → compute + return what would be sent, send nothing
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const dryRun = req.query && (req.query.dryRun === '1' || req.query.dryRun === 'true');

  try {
    // How far the last digest covered.
    const marker = await sql`select max(covered_through) as t from issues`;
    const coveredThrough = marker[0]?.t
      ? new Date(marker[0].t)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Current post list from the site's own feed.
    const feedRes = await fetch(`${SITE_URL}/newsletter-feed.json`, {
      headers: { 'User-Agent': 'smallspacehome-broadcast' },
    });
    if (!feedRes.ok) throw new Error(`feed fetch failed: HTTP ${feedRes.status}`);
    const feed = await feedRes.json();

    const newPosts = (feed.posts || [])
      .filter((p) => new Date(p.datePublished) > coveredThrough)
      .sort((a, b) => new Date(a.datePublished) - new Date(b.datePublished))
      .slice(-MAX_POSTS_PER_DIGEST);

    if (!newPosts.length) {
      return res.status(200).json({
        ok: true,
        sent: 0,
        reason: `no posts newer than ${coveredThrough.toISOString()}`,
      });
    }

    const subs = await sql`select email, token from subscribers where status = 'active'`;

    if (!subs.length) {
      return res.status(200).json({ ok: true, sent: 0, reason: 'no active subscribers' });
    }

    const newestDate = newPosts.reduce(
      (max, p) => (new Date(p.datePublished) > max ? new Date(p.datePublished) : max),
      new Date(0)
    );

    if (dryRun) {
      const preview = digestEmail({ posts: newPosts, unsubUrl: `${SITE_URL}/api/unsubscribe?token=SAMPLE` });
      return res.status(200).json({
        ok: true,
        dryRun: true,
        wouldSendTo: subs.length,
        subject: preview.subject,
        posts: newPosts.map((p) => p.title),
        coveredThrough: coveredThrough.toISOString(),
        wouldAdvanceTo: newestDate.toISOString(),
      });
    }

    const messages = subs.map((s) => {
      const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${s.token}`;
      const { subject, html, text, listUnsubscribe } = digestEmail({ posts: newPosts, unsubUrl });
      return { to: s.email, subject, html, text, listUnsubscribe };
    });

    const result = await sendBatch(messages);

    const slug = `digest-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await sql`
      insert into issues (slug, subject, sent_at, recipient_count, covered_through)
      values (${slug}, ${messages[0].subject}, now(), ${result.sent}, ${newestDate.toISOString()})
    `;

    console.log('[newsletter] digest sent', { ...result, posts: newPosts.length, recipients: subs.length });
    return res.status(200).json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      recipients: subs.length,
      posts: newPosts.map((p) => p.title),
      errors: result.errors,
    });
  } catch (err) {
    console.error('[newsletter] broadcast failed:', err);
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}
