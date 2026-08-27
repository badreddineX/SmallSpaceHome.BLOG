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

## Weekly digest (built)

Auto-generated "what's new on the blog" email. **No hand-writing** — it reads the
site's own post list and sends only when there's something new.

```
Vercel Cron (Mon 13:00 UTC)  ──▶  /api/broadcast
   │ max(covered_through) from issues  →  "last covered" date
   │ fetch /newsletter-feed.json       →  current post list (title, blurb, image, category)
   │ posts newer than last-covered, capped at 6
   │ if none → exit, send nothing
   │ else → digestEmail() per subscriber (own unsubscribe link)
   │        sendBatch() via Resend, 100/batch
   ▼ insert issues row (covered_through = newest post date)
```

| File | Role |
|---|---|
| `src/pages/newsletter-feed.json.js` | machine-readable post list (excluded from sitemap) |
| `api/broadcast.js` | the cron endpoint |
| `api/_lib/resend.js` | Resend batch sender (bulk only) |
| `api/_lib/templates.js` → `digestEmail()` | the digest layout |
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

First real run: `covered_through` is empty, so it sends the **last 7 days** of
posts (max 6). To seed the marker without emailing the backlog, insert a row by
hand first: `insert into issues (slug, subject, covered_through) values ('seed', 'seed', now());`

### Later — shop block

When the Fourthwall store is live, add a "From the shop" section to
`digestEmail()` in `templates.js` (a few product cards under the post list).
