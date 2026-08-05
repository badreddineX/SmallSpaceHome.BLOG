/**
 * Professional Ebook Template Generator
 * Builds a single-blog template PDF: full design system + Hormozi chapter framework
 * Usage: CHROMIUM_PATH=... node ebook-template-gen.mjs <config.json> <output.pdf>
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const configFile = process.argv[2];
const outputFile = process.argv[3];

if (!configFile || !outputFile) {
  console.error('Usage: node ebook-template-gen.mjs <config.json> <output.pdf>');
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(configFile, 'utf8'));

// ── Palette ──────────────────────────────────────────────────────────────────
const palettes = {
  ssh: {
    ink:       '#1E241F',
    cream:     '#FAF7F0',
    sage:      '#7A8B6F',
    green:     '#4A5A44',
    tan:       '#A8845C',
    gold:      '#C9A87C',
    label:     'SmallSpaceHome',
    domain:    'smallspacehome.blog',
    coverBand: '#7A8B6F',
  },
  bh: {
    ink:       '#1A2318',
    cream:     '#F3F4EF',
    sage:      '#7A8B6F',
    green:     '#47612F',
    tan:       '#B89A6A',
    gold:      '#B89A6A',
    label:     'British Home',
    domain:    'british-home.blog',
    coverBand: '#47612F',
  },
};

const p = palettes[cfg.brand] || palettes.ssh;

// ── Shared CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:    ${p.ink};
  --cream:  ${p.cream};
  --sage:   ${p.sage};
  --green:  ${p.green};
  --tan:    ${p.tan};
  --gold:   ${p.gold};
  --band:   ${p.coverBand};
  --serif:  'Playfair Display', Georgia, 'Times New Roman', serif;
  --sans:   'Inter', 'Helvetica Neue', Arial, sans-serif;
  --page-w: 8.5in;
  --page-h: 11in;
  --pad-x:  0.875in;
  --pad-top: 0.65in;
  --pad-bot: 0.6in;
}

body {
  font-family: var(--sans);
  font-size: 10.5pt;
  color: var(--ink);
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── PAGE SHELL ── */
.page {
  width: var(--page-w);
  min-height: var(--page-h);
  height: var(--page-h);
  overflow: hidden;
  position: relative;
  page-break-after: always;
  page-break-inside: avoid;
  background: #fff;
}
.page-cream  { background: var(--cream); }
.page-dark   { background: var(--ink); }
.page-cover  { background: var(--cream); }

/* ─────────────────────────── COVER ──────────────────────────── */
.cover-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.cover-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.9in 1.1in 0.4in;
  text-align: center;
  position: relative;
}

/* outer decorative frame */
.cover-frame {
  position: absolute;
  inset: 0.35in;
  border: 1px solid var(--gold);
  opacity: 0.45;
  pointer-events: none;
}
.cover-frame::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 0.5px solid var(--gold);
  opacity: 0.6;
}

/* corner ornaments */
.cover-corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: var(--gold);
  border-style: solid;
  opacity: 0.75;
}
.cover-corner.tl { top: 0.3in; left: 0.3in;  border-width: 1.5px 0 0 1.5px; }
.cover-corner.tr { top: 0.3in; right: 0.3in; border-width: 1.5px 1.5px 0 0; }
.cover-corner.bl { bottom: 0.3in; left: 0.3in;  border-width: 0 0 1.5px 1.5px; }
.cover-corner.br { bottom: 0.3in; right: 0.3in; border-width: 0 1.5px 1.5px 0; }

.cover-domain {
  font-family: var(--sans);
  font-size: 7.5pt;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--tan);
  margin-bottom: 0.38in;
}
.cover-eyebrow {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 0.14in;
  opacity: 0.8;
}
.cover-title {
  font-family: var(--serif);
  font-size: 34pt;
  font-weight: 700;
  line-height: 1.18;
  color: var(--ink);
  margin-bottom: 0.2in;
  max-width: 5.2in;
}
.cover-rule {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto 0.2in;
  width: 3in;
}
.cover-rule-line {
  flex: 1;
  height: 1px;
  background: var(--gold);
  opacity: 0.7;
}
.cover-rule-diamond {
  font-size: 8pt;
  color: var(--gold);
  opacity: 0.9;
}
.cover-subtitle {
  font-family: var(--sans);
  font-size: 10.5pt;
  font-weight: 300;
  line-height: 1.65;
  color: var(--ink);
  opacity: 0.7;
  max-width: 4.4in;
  margin-bottom: 0.36in;
}
.cover-divider {
  width: 28px;
  height: 2px;
  background: var(--gold);
  margin: 0 auto 0.18in;
}
.cover-edition {
  font-family: var(--serif);
  font-style: italic;
  font-size: 9pt;
  color: var(--tan);
  letter-spacing: 0.06em;
}

.cover-band {
  background: var(--band);
  height: 0.55in;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cover-band-text {
  font-family: var(--sans);
  font-size: 7.5pt;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.78);
}

/* ─────────────────────── HOW-TO PAGE ─────────────────────── */
.howto-wrap {
  padding: var(--pad-top) var(--pad-x) var(--pad-bot);
  height: 100%;
}
.howto-eyebrow {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--tan);
  margin-bottom: 8px;
}
.howto-title {
  font-family: var(--serif);
  font-size: 20pt;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 6px;
  line-height: 1.25;
}
.howto-rule {
  width: 100%;
  height: 1px;
  background: var(--gold);
  opacity: 0.4;
  margin: 16px 0 22px;
}
.howto-intro {
  font-size: 10.5pt;
  line-height: 1.7;
  color: var(--ink);
  opacity: 0.85;
  margin-bottom: 24px;
  max-width: 5.8in;
}
.howto-intro strong { font-weight: 600; opacity: 1; color: var(--ink); }

.framework-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  margin-top: 4px;
}
.framework-card {
  background: var(--cream);
  border-left: 3px solid var(--gold);
  padding: 12px 14px;
  border-radius: 0 4px 4px 0;
}
.fc-num {
  font-family: var(--serif);
  font-size: 10pt;
  font-weight: 700;
  color: var(--tan);
  margin-bottom: 3px;
}
.fc-label {
  font-family: var(--sans);
  font-size: 8.5pt;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 4px;
}
.fc-desc {
  font-size: 9pt;
  line-height: 1.55;
  color: var(--ink);
  opacity: 0.78;
}

.hormozi-quote {
  margin-top: 20px;
  padding: 14px 18px;
  background: var(--cream);
  border: 1px solid rgba(168,132,92,0.3);
  border-radius: 3px;
}
.hq-text {
  font-family: var(--serif);
  font-style: italic;
  font-size: 10pt;
  line-height: 1.6;
  color: var(--ink);
  opacity: 0.88;
}
.hq-attr {
  font-size: 8pt;
  color: var(--tan);
  margin-top: 6px;
  font-weight: 500;
  letter-spacing: 0.08em;
}

/* ─────────────────────────── TOC ─────────────────────────── */
.toc-wrap {
  padding: var(--pad-top) var(--pad-x) var(--pad-bot);
  height: 100%;
}
.toc-header { margin-bottom: 28px; }
.toc-eyebrow {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--tan);
  margin-bottom: 6px;
}
.toc-title {
  font-family: var(--serif);
  font-size: 22pt;
  font-weight: 700;
  color: var(--ink);
}
.toc-rule {
  width: 100%;
  height: 1px;
  background: var(--gold);
  opacity: 0.4;
  margin: 14px 0 0;
}

.toc-list { list-style: none; }
.toc-item {
  display: flex;
  align-items: baseline;
  gap: 0;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(168,132,92,0.22);
}
.toc-num {
  font-family: var(--serif);
  font-size: 10.5pt;
  font-weight: 700;
  color: var(--tan);
  width: 34px;
  flex-shrink: 0;
}
.toc-ch-title {
  font-family: var(--sans);
  font-size: 10pt;
  color: var(--ink);
  flex: 1;
  line-height: 1.4;
}
.toc-dots {
  flex: 1;
  height: 1px;
  border-bottom: 1px dotted rgba(168,132,92,0.4);
  margin: 0 8px 3px;
  max-width: 1in;
}
.toc-pg {
  font-size: 9pt;
  color: var(--tan);
  font-weight: 500;
  width: 18px;
  text-align: right;
  flex-shrink: 0;
}
.toc-section-label {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--green);
  padding: 18px 0 6px;
  display: block;
}

/* ─────────────────── CHAPTER OPENER ──────────────────── */
.ch-opener-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 0.6in 1in;
  text-align: center;
  position: relative;
}
.ch-watermark {
  position: absolute;
  font-family: var(--serif);
  font-size: 240pt;
  font-weight: 700;
  color: var(--tan);
  opacity: 0.055;
  line-height: 1;
  user-select: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  letter-spacing: -0.05em;
}
.ch-eyebrow {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--tan);
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}
.ch-rule-trio {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
.ch-rule-short { width: 20px; height: 1px; background: var(--gold); }
.ch-rule-diamond { font-size: 7pt; color: var(--gold); }
.ch-title {
  font-family: var(--serif);
  font-size: 26pt;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
  margin-bottom: 22px;
  max-width: 5in;
  position: relative;
  z-index: 1;
}
.ch-outcome {
  font-family: var(--serif);
  font-style: italic;
  font-size: 11pt;
  color: var(--green);
  line-height: 1.6;
  max-width: 4.2in;
  position: relative;
  z-index: 1;
}
.ch-outcome-label {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--tan);
  opacity: 0.7;
  margin-top: 14px;
  position: relative;
  z-index: 1;
}

/* ─────────────────── BODY PAGE ──────────────────── */
.body-page-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}
.body-header {
  padding: 0.42in var(--pad-x) 0;
  flex-shrink: 0;
}
.body-ch-label {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--tan);
  display: block;
  margin-bottom: 8px;
}
.body-header-rule {
  width: 100%;
  height: 1px;
  background: var(--tan);
  opacity: 0.25;
}
.body-content {
  flex: 1;
  padding: 26px var(--pad-x) var(--pad-bot);
  overflow: hidden;
}
.page-num {
  position: absolute;
  bottom: 0.28in;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--sans);
  font-size: 8pt;
  color: var(--tan);
  opacity: 0.6;
  letter-spacing: 0.1em;
}

/* section blocks */
.section {
  margin-bottom: 20px;
}
.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
}
.section-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--tan);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--sans);
  font-size: 8pt;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}
.section-label {
  font-family: var(--sans);
  font-size: 7.5pt;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--green);
}
.section-heading {
  font-family: var(--serif);
  font-size: 13pt;
  font-weight: 700;
  color: var(--green);
  line-height: 1.28;
  margin-bottom: 8px;
}
.section-body {
  font-size: 10.5pt;
  line-height: 1.7;
  color: var(--ink);
  opacity: 0.88;
}
.section-body p { margin-bottom: 7px; }
.section-body strong { font-weight: 600; color: var(--ink); opacity: 1; }

/* placeholder styling */
.placeholder {
  background: repeating-linear-gradient(
    -45deg,
    rgba(168,132,92,0.04),
    rgba(168,132,92,0.04) 4px,
    transparent 4px,
    transparent 10px
  );
  border: 1px dashed rgba(168,132,92,0.3);
  border-radius: 3px;
  padding: 10px 13px;
  font-size: 10pt;
  line-height: 1.65;
  color: var(--ink);
  opacity: 0.55;
  font-style: italic;
}

.callout {
  background: var(--cream);
  border-left: 3px solid var(--gold);
  padding: 11px 15px;
  border-radius: 0 3px 3px 0;
  margin-top: 10px;
}
.callout-label {
  font-family: var(--sans);
  font-size: 7pt;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--tan);
  margin-bottom: 5px;
}
.callout-text {
  font-size: 10pt;
  line-height: 1.6;
  color: var(--ink);
  opacity: 0.82;
}

.checklist {
  list-style: none;
  margin-top: 8px;
}
.checklist li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 10pt;
  line-height: 1.6;
  color: var(--ink);
  opacity: 0.85;
  margin-bottom: 5px;
}
.checklist li::before {
  content: '□';
  color: var(--tan);
  font-size: 11pt;
  flex-shrink: 0;
  margin-top: 1px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
}
.divider-line { flex: 1; height: 1px; background: var(--gold); opacity: 0.3; }
.divider-mark { font-size: 8pt; color: var(--gold); opacity: 0.6; }

/* ── print ── */
@media print {
  @page { size: 8.5in 11in; margin: 0; }
  .page { page-break-after: always; }
}
`;

// ── PAGE BUILDERS ─────────────────────────────────────────────────────────────

function coverPage() {
  return `
<div class="page page-cover">
  <div class="cover-wrap">
    <div class="cover-main">
      <div class="cover-frame"></div>
      <div class="cover-corner tl"></div>
      <div class="cover-corner tr"></div>
      <div class="cover-corner bl"></div>
      <div class="cover-corner br"></div>

      <p class="cover-domain">${p.domain}</p>
      <p class="cover-eyebrow">${cfg.series || 'The Essential Series'}</p>
      <h1 class="cover-title">${cfg.title}</h1>
      <div class="cover-rule">
        <div class="cover-rule-line"></div>
        <span class="cover-rule-diamond">✦</span>
        <div class="cover-rule-line"></div>
      </div>
      <p class="cover-subtitle">${cfg.subtitle}</p>
      <div class="cover-divider"></div>
      <p class="cover-edition">${cfg.edition || 'Design Template Edition'}</p>
    </div>
    <div class="cover-band">
      <span class="cover-band-text">${p.label} · ${cfg.year || new Date().getFullYear()}</span>
    </div>
  </div>
</div>`;
}

function howToPage() {
  return `
<div class="page page-cream">
  <div class="howto-wrap">
    <p class="howto-eyebrow">How to Use This Template</p>
    <h2 class="howto-title">The Hormozi Ebook Framework</h2>
    <div class="howto-rule"></div>

    <p class="howto-intro">
      Every chapter in this template follows Alex Hormozi's <strong>Value Equation</strong>: maximise the <strong>Dream Outcome</strong>,
      increase <strong>Perceived Likelihood of Achievement</strong>, reduce <strong>Time to Result</strong>, and eliminate
      <strong>Perceived Effort</strong>. Applied to each chapter, this creates content readers cannot stop reading — and cannot stop recommending.
    </p>

    <div class="framework-grid">
      <div class="framework-card">
        <div class="fc-num">① Hook</div>
        <div class="fc-label">Dream Outcome First</div>
        <div class="fc-desc">Open with the specific, quantified result the reader gets from this chapter. Name the number, the timeframe, the transformation. Make it feel real and achievable.</div>
      </div>
      <div class="framework-card">
        <div class="fc-num">② Problem</div>
        <div class="fc-label">Name the Pain Precisely</div>
        <div class="fc-desc">State the specific frustration. Use "Most people…" to create recognition. The reader should think "that's me." Specificity beats generality every time.</div>
      </div>
      <div class="framework-card">
        <div class="fc-num">③ Mechanism</div>
        <div class="fc-label">The How — Your Core Value</div>
        <div class="fc-desc">The actual solution: step-by-step, principle-by-principle. Specific prices, named brands, exact measurements. Vague advice is cheap. Specific guidance is rare.</div>
      </div>
      <div class="framework-card">
        <div class="fc-num">④ Proof</div>
        <div class="fc-label">Real Example With Numbers</div>
        <div class="fc-desc">A before/after story from your own experience. One specific story with details beats ten vague testimonials. Numbers make it 10× more believable.</div>
      </div>
      <div class="framework-card">
        <div class="fc-num">⑤ Quick Wins</div>
        <div class="fc-label">Reduce Perceived Effort</div>
        <div class="fc-desc">3–5 things they can do immediately. Low effort, high impact. The reader should be able to start today. This is what makes them feel the guide is already paying off.</div>
      </div>
      <div class="framework-card">
        <div class="fc-num">⑥ Takeaway</div>
        <div class="fc-label">Bridge to the Next Chapter</div>
        <div class="fc-desc">One sentence summary of this chapter's core idea. Then a single sentence bridging to why the next chapter matters. Creates forward momentum and reduces drop-off.</div>
      </div>
    </div>

    <div class="hormozi-quote">
      <p class="hq-text">"The product doesn't sell itself. It's the transformation — the before and after — that sells. Name the after first, always."</p>
      <p class="hq-attr">— Alex Hormozi, $100M Offers</p>
    </div>
  </div>
</div>`;
}

function tocPage(chapters) {
  const entries = chapters.map((ch, i) => `
    <li class="toc-item">
      <span class="toc-num">${String(i+1).padStart(2,'0')}</span>
      <span class="toc-ch-title">${ch.title}</span>
      <span class="toc-dots"></span>
      <span class="toc-pg">${4 + i * 3}</span>
    </li>`).join('');

  return `
<div class="page page-cream">
  <div class="toc-wrap">
    <div class="toc-header">
      <p class="toc-eyebrow">Table of Contents</p>
      <h2 class="toc-title">What's Inside</h2>
      <div class="toc-rule"></div>
    </div>

    <span class="toc-section-label">Chapters</span>
    <ol class="toc-list">
      ${entries}
    </ol>
  </div>
</div>`;
}

function chapterOpener(ch, idx) {
  const num = String(idx + 1).padStart(2, '0');
  return `
<div class="page page-cream">
  <div class="ch-opener-wrap">
    <div class="ch-watermark">${num}</div>
    <p class="ch-eyebrow">Chapter ${idx + 1} of ${cfg.chapters.length}</p>
    <div class="ch-rule-trio">
      <div class="ch-rule-short"></div>
      <span class="ch-rule-diamond">✦</span>
      <div class="ch-rule-short"></div>
    </div>
    <h2 class="ch-title">${ch.title}</h2>
    <p class="ch-outcome">${ch.dreamOutcome}</p>
    <p class="ch-outcome-label">Dream Outcome</p>
  </div>
</div>`;
}

function bodyPage(ch, idx, sections, pgNum) {
  const num = String(idx + 1).padStart(2, '0');
  const content = sections.map(sec => {
    const isPlaceholder = sec.placeholder === true;
    return `
    <div class="section">
      <div class="section-tag">
        <span class="section-num">${sec.num}</span>
        <span class="section-label">${sec.label}</span>
      </div>
      <h3 class="section-heading">${sec.heading}</h3>
      ${isPlaceholder
        ? `<div class="placeholder">${sec.body}</div>`
        : `<div class="section-body"><p>${sec.body}</p></div>`
      }
      ${sec.callout ? `
      <div class="callout">
        <div class="callout-label">${sec.callout.label || 'Key Insight'}</div>
        <div class="callout-text">${sec.callout.text}</div>
      </div>` : ''}
      ${sec.checklist ? `
      <ul class="checklist">
        ${sec.checklist.map(it => `<li>${it}</li>`).join('')}
      </ul>` : ''}
    </div>`;
  }).join('<div class="divider"><div class="divider-line"></div><span class="divider-mark">✦</span><div class="divider-line"></div></div>');

  return `
<div class="page">
  <div class="body-page-inner">
    <div class="body-header">
      <span class="body-ch-label">Chapter ${idx + 1} · ${ch.title}</span>
      <div class="body-header-rule"></div>
    </div>
    <div class="body-content">
      ${content}
    </div>
  </div>
  <span class="page-num">${pgNum}</span>
</div>`;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  const pages = [];

  pages.push(coverPage());
  pages.push(howToPage());
  pages.push(tocPage(cfg.chapters));

  let pgNum = 4;
  cfg.chapters.forEach((ch, idx) => {
    pages.push(chapterOpener(ch, idx));
    pgNum++;

    // Split sections across body pages (2 per page)
    const allSections = ch.sections || [];
    for (let i = 0; i < allSections.length; i += 2) {
      const slice = allSections.slice(i, i + 2);
      pages.push(bodyPage(ch, idx, slice, pgNum));
      pgNum++;
    }
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${cfg.title}</title>
<style>${CSS}</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>`;

  const htmlPath = resolve(outputFile.replace('.pdf', '.html'));
  writeFileSync(htmlPath, html);
  console.log(`HTML: ${htmlPath}`);

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  writeFileSync(outputFile, pdf);
  console.log(`PDF: ${outputFile} (${(pdf.length / 1024).toFixed(0)} KB, ${pages.length} pages)`);
  await browser.close();
})();
