# SmallSpace Home — Newsletter

Self-hosted email capture + double opt-in, running as Vercel serverless functions
against a Neon Postgres database. Transactional email (confirm / welcome /
unsubscribe) goes out through the Hostinger mailbox over SMTP.

The **weekly digest** (auto "what's new on the blog") is built too — see
[Weekly digest](#weekly-digest-built) at the bottom. It needs a Resend key set
before it does anything.

---

## Architecture

```
Visitor → <form class="nl-form">  ──POST──▶  /api/subscribe
                                              │ insert 'pending' + token
                                              │ send confirm email (Hostinger SMTP)
                                              ▼
Confirm email link  ──GET──▶  /api/confirm?token=…
                                 │ status → 'active', store confirmed_at
                                 │ send welcome email
                                 ▼
                              302 → /thank-you?src=newsletter

Every email footer → /api/unsubscribe?token=…  (GET link + RFC-8058 one-click POST)
```

| File | Role |
|---|---|
| `api/subscribe.js` | validate email, upsert `pending` row, e‑mail the confirm link |
| `api/confirm.js` | flip `pending`→`active`, send welcome, redirect to `/thank-you?src=newsletter` |
| `api/unsubscribe.js` | flip any status → `unsubscribed` (GET shows a page, POST = one-click) |
| `api/_lib/*` | shared db / mail / templates / helpers (the `_` prefix keeps them off the route table) |
| `src/components/NewsletterForm.astro` | the signup card (rendered at the end of every blog post) |
| `src/components/Footer.astro` | dark footer signup band **+ the shared submit script for every `.nl-form`** |
| `src/pages/thank-you.astro` | post-signup / post-confirm landing (`?src=newsletter`, `newsletter-pending`, `newsletter-error`) |
| `db/schema.sql` | one-time table setup |

The site stays a **static Astro build** — no adapter. Vercel picks up `/api`
as Node serverless functions automatically.

---

## One-time setup

### 1. Database — Neon (free)

1. Create a project at <https://neon.tech> (region: AWS `us-east` or `ca-central` if offered).
2. Open **SQL Editor**, paste the contents of [`db/schema.sql`](db/schema.sql), run it.
3. **Connection Details → Pooled connection** → copy the string (host contains `-pooler`).

### 2. Environment variables — Vercel

Project → **Settings → Environment Variables**, add for **Production** and **Preview**
(names and shapes are in [`.env.example`](.env.example)):

| Var | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `SITE_URL` | `https://smallspacehome.ca` |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | the Hostinger mailbox, e.g. `newsletter@smallspacehome.ca` |
| `SMTP_PASS` | that mailbox's password |
| `NEWSLETTER_FROM` | `SmallSpace Home <newsletter@smallspacehome.ca>` |
| `NEWSLETTER_REPLY_TO` | `hello@smallspacehome.ca` |
| `MAILING_ADDRESS` | *(optional)* physical postal address for the email footer — CASL/CAN-SPAM require one for bulk mail; fine to add later, before the list scales |

Create the `newsletter@` mailbox in Hostinger's hPanel first if it doesn't exist.

### 3. Email deliverability (Hostinger DNS)

Hostinger already publishes an SPF + DKIM record for the domain's mailboxes, so
transactional mail is aligned out of the box. Just confirm in hPanel → **Emails →
DNS records** that SPF and DKIM show green. Add a DMARC record if there isn't one:

```
_dmarc  TXT  "v=DMARC1; p=none; rua=mailto:hello@smallspacehome.ca"
```

### 4. Deploy & smoke-test

1. `git push` → Vercel builds.
2. Subscribe with a real address from the site footer.
3. Confirm the email arrives, click the link → lands on `/thank-you?src=newsletter`,
   welcome email arrives.
4. In Neon: `select email, status, confirmed_at from subscribers;` → row is `active`.
5. Click the unsubscribe link in the welcome email → row goes `unsubscribed`.

### Local dev

`npm run dev` serves the site but **not** `/api` (needs the Vercel runtime).
To exercise the endpoints locally: `npx vercel dev` with a `.env.local` holding
the vars above.

---

## Operations

**List size / export**
```sql
select count(*) filter (where status='active')   as active,
       count(*) filter (where status='pending')  as pending,
       count(*) filter (where status='unsubscribed') as gone
from subscribers;

-- export the sending list
\copy (select email from subscribers where status='active') to 'subscribers.csv' csv header;
```

**Manually remove someone**
```sql
update subscribers set status='unsubscribed', unsubscribed_at=now() where email = lower('x@y.com');
```

---

## The weekly email (built)

Every Monday. **Leads with a curated "idea of the week"** from a queue you write
ahead of time (`src/content/ideas/*.md`); any posts published since the last
send follow underneath. Sends if there's an unsent idea OR a new post.

```
Vercel Cron (Mon 13:00 UTC)  ──▶  /api/broadcast
   │ fetch /newsletter-feed.json  →  recent posts + the idea queue
   │ next idea whose filename isn't already in issues.idea_slug
   │ posts newer than max(covered_through), capped at 6
   │ neither? → skip
   │ else → digestEmail({ idea, posts }) per subscriber, sendBatch via Resend
   ▼ insert issues row (idea_slug = the idea used, covered_through = newest post)
```

### Writing the weekly ideas

One markdown file per idea in `src/content/ideas/`. Format + the current queue
are in `src/content/ideas/HOW-TO.txt`. They go out in `order:` sequence, one per
week, never repeated. When the queue empties and there's no new post, the email
just skips that week — so keep 3–4 ideas ahead.

| File | Role |
|---|---|
| `src/content/ideas/*.md` | the weekly-idea queue (you write these) |
| `src/pages/newsletter-feed.json.js` | feed: recent posts + idea queue (sitemap-excluded) |
| `api/broadcast.js` | the cron endpoint |
| `api/_lib/resend.js` | Resend batch sender (bulk only) |
| `api/_lib/templates.js` → `digestEmail()` | the email layout |
| `vercel.json` → `crons` | weekly trigger |

### Setup

1. **Resend** (resend.com, free): add a **sending subdomain** `send.smallspacehome.ca`
   → paste the DNS records it shows into Hostinger (SPF/DKIM/MX for that
   subdomain only — the `hello@` mailbox is untouched). Wait for "Verified".
2. Create an API key → Vercel env:

   | Var | Value |
   |---|---|
   | `RESEND_API_KEY` | `re_…` from Resend |
   | `NEWSLETTER_BULK_FROM` | `SmallSpace Home <hello@send.smallspacehome.ca>` |
   | `CRON_SECRET` | a long random string |

3. Run the `issues` table migration in Neon (safe to re-run):
   ```sql
   alter table issues add column if not exists covered_through timestamptz;
   alter table issues add column if not exists idea_slug text;
   ```
4. Deploy. Vercel registers the cron from `vercel.json` automatically
   (Project → Settings → Cron Jobs to confirm).

### Testing / manual trigger

```bash
# dry run — shows what would be sent, sends nothing
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://smallspacehome.ca/api/broadcast?dryRun=1"

# real send
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://smallspacehome.ca/api/broadcast"
```

First real run with an empty `issues` table sends the last 7 days of posts
(max 6) plus idea #1. To skip the post backlog, seed the marker first:
`insert into issues (slug, subject, covered_through) values ('seed', 'seed', now());`

### Later — shop block

When the Fourthwall store is live, add a "From the shop" section to
`digestEmail()` in `templates.js` (a few product cards under the post list).
