import { sql } from './_lib/db.js';
import { sendBatch } from './_lib/resend.js';
import { digestEmail } from './_lib/templates.js';

const SITE_URL = (process.env.SITE_URL || 'https://smallspacehome.ca').replace(/\/$/, '');
const MAX_POSTS_PER_EMAIL = 6;

// The weekly email. Triggered by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer <CRON_SECRET>` automatically; the same header lets you
// trigger it by hand. ?dryRun=1 → compute + return, send nothing.
//
// Each run: pick the next unsent weekly idea + any posts published since the
// last email. Send if there's at least one of the two; otherwise skip.
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const dryRun = req.query && (req.query.dryRun === '1' || req.query.dryRun === 'true');

  try {
    const [marker, sentIdeaRows] = await Promise.all([
      sql`select max(covered_through) as t from issues`,
      sql`select idea_slug from issues where idea_slug is not null`,
    ]);
    const coveredThrough = marker[0]?.t
      ? new Date(marker[0].t)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sentIdeas = new Set(sentIdeaRows.map((r) => r.idea_slug));

    const feedRes = await fetch(`${SITE_URL}/newsletter-feed.json`, {
      headers: { 'User-Agent': 'smallspacehome-broadcast' },
    });
    if (!feedRes.ok) throw new Error(`feed fetch failed: HTTP ${feedRes.status}`);
    const feed = await feedRes.json();

    const newPosts = (feed.posts || [])
      .filter((p) => new Date(p.datePublished) > coveredThrough)
      .sort((a, b) => new Date(a.datePublished) - new Date(b.datePublished))
      .slice(-MAX_POSTS_PER_EMAIL);

    const idea =
      (feed.ideas || [])
        .sort((a, b) => a.order - b.order)
        .find((i) => !sentIdeas.has(i.slug)) || null;

    if (!idea && !newPosts.length) {
      return res.status(200).json({
        ok: true,
        sent: 0,
        reason: 'nothing to send — no unsent idea and no new posts',
      });
    }

    const subs = await sql`select email, token from subscribers where status = 'active'`;
    if (!subs.length) {
      return res.status(200).json({ ok: true, sent: 0, reason: 'no active subscribers' });
    }

    const newestDate = newPosts.length
      ? newPosts.reduce(
          (max, p) => (new Date(p.datePublished) > max ? new Date(p.datePublished) : max),
          new Date(0)
        )
      : null;

    if (dryRun) {
      const preview = digestEmail({ idea, posts: newPosts, unsubUrl: `${SITE_URL}/api/unsubscribe?token=SAMPLE` });
      return res.status(200).json({
        ok: true,
        dryRun: true,
        wouldSendTo: subs.length,
        subject: preview.subject,
        idea: idea ? idea.title : null,
        posts: newPosts.map((p) => p.title),
        coveredThrough: coveredThrough.toISOString(),
        wouldAdvanceTo: newestDate ? newestDate.toISOString() : '(unchanged)',
      });
    }

    const messages = subs.map((s) => {
      const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${s.token}`;
      const { subject, html, text, listUnsubscribe } = digestEmail({ idea, posts: newPosts, unsubUrl });
      return { to: s.email, subject, html, text, listUnsubscribe };
    });

    const result = await sendBatch(messages);

    const slug = `weekly-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await sql`
      insert into issues (slug, subject, sent_at, recipient_count, covered_through, idea_slug)
      values (
        ${slug}, ${messages[0].subject}, now(), ${result.sent},
        ${newestDate ? newestDate.toISOString() : null},
        ${idea ? idea.slug : null}
      )
    `;

    console.log('[newsletter] weekly sent', {
      ...result,
      idea: idea?.slug || null,
      posts: newPosts.length,
      recipients: subs.length,
    });
    return res.status(200).json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      recipients: subs.length,
      idea: idea ? idea.title : null,
      posts: newPosts.map((p) => p.title),
      errors: result.errors,
    });
  } catch (err) {
    console.error('[newsletter] broadcast failed:', err);
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}
