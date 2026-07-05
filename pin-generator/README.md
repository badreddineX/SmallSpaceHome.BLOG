# Pinterest Pin Generator

Renders 1000x1500 branded Pinterest pins (templates A/B/C) from `pins.json`.
Run from the repository root:

```bash
npm install playwright
npx playwright install chromium   # first time only
node pin-generator/generate-pins.mjs pin-generator/pins.json
```

PNGs land in `out*/`. To add pins for a new blog post, append three
entries (templates A, B, C) to `pins.json`:

```json
{"slug":"my-new-post","template":"A","kicker":"...","headline":"... <em>accent</em> ...","domain":"...","photo":"./public/images/its-cover.jpg"}
```

`<em>word</em>` renders the accent word in italic. Keep headlines under
~8 words so they fit the canvas.
