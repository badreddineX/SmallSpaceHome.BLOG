# social/ — Instagram auto-poster

Both blogs post to **Instagram + Pinterest**. Pinterest is daily/manual for now.
This folder automates **Instagram**: post the next queued image + caption on a
schedule, machine-off, free.

## Files

| File | What |
|---|---|
| `../social-posts/CAPTIONS-CAD.md` | source captions, one block per post (human-written) |
| `../social-posts/ready-CAD/NN-<slug>.jpg` | rendered post images, git-tracked → public raw URLs |
| `build-queue.mjs` | captions + images → `queue.json` |
| `queue.json` | machine-readable queue (35 posts) |
| `build-sheet.mjs` | `queue.json` → `queue-sheet.csv` (for the Make.com Google Sheet) |
| `queue-sheet.csv` | import this into the Google Sheet |
| `MAKE-SETUP.md` | **the live path** — Make.com + Google Sheet, no code |
| `SETUP-github-actions.md` | alternative — Meta Graph API + GitHub Actions cron |
| `publish.mjs` / `state.json` | the code poster used by the GitHub-Actions alternative |

## Live setup

Follow **`MAKE-SETUP.md`**. One-time: import the CSV to a Google Sheet, wire a
3-module Make scenario, schedule it, turn it on.

## Adding posts when the queue runs low

1. Add a caption block to `../social-posts/CAPTIONS-CAD.md`
2. Drop the rendered image at `../social-posts/ready-CAD/NN-<slug>.jpg`
   (renderer: `../../tools/social-generator/generate-social.mjs --ig`)
3. `node social/build-queue.mjs && node social/build-sheet.mjs`
4. Commit, then paste the new rows from `queue-sheet.csv` into the Google Sheet
