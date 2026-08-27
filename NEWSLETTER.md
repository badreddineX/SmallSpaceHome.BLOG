# SmallSpace Home — Newsletter

Self-hosted email capture + double opt-in, running as Vercel serverless functions
against a Neon Postgres database. Transactional email (confirm / welcome /
unsubscribe) goes out through the Hostinger mailbox over SMTP.

The **weekly broadcast** is **Phase 2** and is not built yet — see the bottom of
this file.

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
| `src/components/NewsletterForm.astro` | the signup card (end of every post + `/newsletter`) |
| `src/components/Footer.astro` | dark footer signup band **+ the shared submit script for every `.nl-form`** |
| `src/pages/newsletter.astro` | dedicated landing page, renders `?state=` banners |
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

## Phase 2 — the weekly broadcast (not built)

When there are ~30–50 confirmed subscribers and issue #001 is drafted:

1. Add a sending provider — **Resend** (free 3k/mo, 100/day) or **Amazon SES**
   (~$0.10/1k, needs sandbox removal). Add its DKIM record and **merge SPF into
   one record** that lists both Hostinger and the new sender.
2. Write issues as MDX in `src/content/` (new `issues` collection).
3. Build `api/broadcast.js` — bearer-token protected (`BROADCAST_TOKEN`), renders
   the latest issue, loops `status='active'` in batches, sends via the provider,
   writes a row to the `issues` table. Every issue must include the physical
   address + one-click unsubscribe (helpers already in `api/_lib/templates.js`).
