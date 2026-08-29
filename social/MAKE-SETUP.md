# Instagram auto-poster via Make.com

The plan: a Google Sheet holds the post queue, Make.com reads the top unposted
row every day, posts it to Instagram, and stamps the row as done. Runs on Make's
servers — machine off, free tier, no code.

Do this once per blog. It then runs itself until the sheet runs out of rows.

---

## 1. Build the Google Sheet

1. Open the CSV: `social/queue-sheet.csv` (35 rows for CAD — order, slug,
   image_url, caption, posted).
2. New Google Sheet → **File → Import → Upload → `queue-sheet.csv` →
   "Replace spreadsheet"**. Keep the header row.
3. Name it `CAD Instagram queue`. Leave the `posted` column blank.

The `image_url` values point at the rendered images already committed in this
repo (public GitHub raw URLs) — nothing else to host.

## 2. Build the Make scenario

Make.com → **Create a new scenario**. Add three modules in a row:

### Module 1 — Google Sheets · "Search Rows"
| Field | Value |
|---|---|
| Spreadsheet | `CAD Instagram queue` |
| Sheet | `Sheet1` |
| Filter | `posted` — **Is empty** |
| Sort order | `order` — Ascending |
| Maximum number of returned rows | **1** |

### Module 2 — Instagram for Business · "Create a Post"
(Some Make versions call it "Create a Photo Post".)
| Field | Value |
|---|---|
| Connection | your linked Instagram account |
| Media type | **Image** |
| Photo / Image URL | `1. image_url` (map from Module 1) |
| Caption | `1. caption` (map from Module 1) |

### Module 3 — Google Sheets · "Update a Row"
| Field | Value |
|---|---|
| Spreadsheet / Sheet | same as Module 1 |
| Row number | `1. Row number` (Make exposes this on the Search Rows output) |
| `posted` column | `{{formatDate(now; "YYYY-MM-DD")}}` |

## 3. Schedule it

Bottom-left of the scenario → the clock icon → **Scheduling**:

- Run: **Every day**
- Time: add your posting times, e.g. **14:00** and **18:00** (Make lets you add
  more than one time — that's how you get 2 posts/day from one scenario).

Then flip the scenario **ON** (toggle, bottom-left).

## 4. Test

Click **Run once**. It should:
1. pull row 1 (`apartment-decor-ideas-on-a-budget`)
2. post it to Instagram
3. write today's date into that row's `posted` cell

Check the IG account — the post should be live. After that, leave it. Each
scheduled run takes the next blank row.

---

## Day to day

- **Nothing.** It posts until every row has a `posted` date.
- **Add posts:** append rows to the sheet (order, slug, image_url, caption,
  blank posted). To make new images + captions, see `social/README.md` — run
  `node social/build-queue.mjs` then `node social/build-sheet.mjs`, and paste the
  new rows in.
- **Pause:** toggle the scenario OFF.
- **Reorder / skip:** edit the sheet directly. Clear a `posted` cell to re-post
  that row.

## Free-tier math

~2 posts/day × ~3 Make operations each × 30 days ≈ **180 ops/month**, well under
the free **1,000**. One scenario (free tier allows 2).

## Alternative

`social/SETUP-github-actions.md` is a fully code-based version (Meta Graph API +
GitHub Actions cron) — free forever, no dependency on Make keeping its free tier.
Use that if you'd rather not rely on Make long-term.
