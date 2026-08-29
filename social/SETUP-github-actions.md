# Instagram auto-poster — one-time setup

You do this **once**. After that, GitHub posts to Instagram on a schedule with
zero input from you — machine off, no scheduler subscription.

Both blogs post to **Instagram + Pinterest**. Pinterest stays manual/daily for
now; this handles Instagram. There is **no Facebook**.

---

## 1. Instagram must be a Business account linked to a Facebook Page

Meta's API only publishes to Business accounts, and a Business account has to be
linked to a Facebook Page — even though we never post to the Page.

1. Instagram app → Settings → **Account type** → switch to **Business**.
2. When prompted, connect a **Facebook Page**. If you don't have one, make a
   bare Page (any name) — it just has to exist for the link. You never touch it.
3. In **Meta Business Suite** (business.facebook.com) confirm the Page and the
   Instagram account both sit under the same business.

## 2. Create a Meta app

1. developers.facebook.com → **My Apps** → **Create App**.
2. Use case **Other** → type **Business** → name it e.g. `smallspacehome-social`.
3. Add the **Instagram** product (Instagram API with Instagram Login).
4. Leave the app in **Development** mode — no App Review needed, you only post to
   your own connected account.

## 3. Get a never-expiring token (System User)

1. Business Suite → **Settings** (gear) → **Business settings**.
2. **Users → System users → Add** → name `social-poster` → role **Admin**.
3. **Add assets**: the Facebook **Page** (full control), the **Instagram account**
   (full control), and the **app** from step 2.
4. Select the system user → **Generate new token** → pick the app → expiry
   **Never** → tick:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
5. Copy the token → this is `META_TOKEN`.

## 4. Get the Instagram account id

**Graph API Explorer** (developers.facebook.com/tools/explorer), paste the token,
run:

- `me/accounts` → note the Page `id`
- `{that page id}?fields=instagram_business_account` → the `id` inside is
  `IG_USER_ID`

## 5. Put them in GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|------|-------|
| `META_TOKEN` | the system-user token |
| `IG_USER_ID` | the Instagram business account id |

## 6. Test it

Repo → **Actions → Social auto-post → Run workflow** → tick **Dry run** → Run.
The log shows the next post it *would* send. Run again without dry run to publish
one for real. Then the schedule takes over (`.github/workflows/social.yml`,
currently ~1pm and ~6pm US-Eastern).

---

## Day to day

- **Nothing.** It posts on its own until the queue empties.
- When the queue gets low: add a caption block to
  `social-posts/CAPTIONS-CAD.md`, drop the rendered image in
  `social-posts/ready-CAD/NN-<slug>.jpg`, run `node social/build-queue.mjs`,
  commit.
- Pause: disable the workflow in the Actions tab. Change frequency: edit the
  `cron:` lines in the workflow.
- `social/state.json` records what's been posted — don't hand-edit unless you
  want something re-sent.

A System User token with expiry **Never** needs no maintenance. A 60-day user
token would stop working after 60 days — regenerate and update the secret, or
use the System User method above.
