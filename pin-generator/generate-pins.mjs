// Pinterest pin generator for smallspacehome.ca — v2 "attractive" edition
// For every blog post: 3 pins (A = Full-Bleed, B = Split, C = Framed), same cover photo.
// Headlines support <em>word</em> → rendered as italic accent in tan.
// Usage: node generate-pins.mjs [pins.json]

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Montserrat:wght@600;700&display=swap" rel="stylesheet">`;

const BASE_CSS = `
  :root{ --ink:#1E241F; --cream:#FAF7F0; --sage:#7A8B6F; --sage-deep:#4A5A44;
         --tan:#A8845C; --tan-light:#C9A87C; }
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1000px;height:1500px;overflow:hidden}
  .kicker{font-family:'Montserrat',sans-serif;font-weight:700;font-size:28px;
          letter-spacing:.30em;text-transform:uppercase}
  .domain{font-family:'Montserrat',sans-serif;font-weight:600;font-size:25px;
          letter-spacing:.24em;text-transform:uppercase}
  h2{font-family:'Playfair Display',serif;font-weight:600}
  h2 em{font-style:italic}
`;

const templates = {
  // ===== A · FULL-BLEED — photo fills canvas, editorial stack at bottom =====
  A: (p) => `
    <style>${BASE_CSS}
      body{display:flex;flex-direction:column;justify-content:flex-end;padding:96px 90px;
        background:
          ${p.brightPhoto
            ? "linear-gradient(180deg, rgba(20,26,18,0) 15%, rgba(20,26,18,.60) 45%, rgba(14,18,12,.97) 100%)"
            : "linear-gradient(180deg, rgba(20,26,18,0) 30%, rgba(20,26,18,.50) 55%, rgba(14,18,12,.94) 100%)"},
          url('${p.photo}') center/cover no-repeat;}
      .accent-rule{width:64px;height:3px;background:var(--tan-light);margin-bottom:26px}
      .kicker{color:var(--tan-light);margin-bottom:24px}
      h2{font-size:92px;line-height:1.14;color:#FDFCF7;margin-bottom:40px;
         text-shadow:0 2px 28px rgba(0,0,0,.35)}
      h2 em{color:var(--tan-light)}
      .domain{color:rgba(250,247,240,.9);display:flex;align-items:center;gap:18px}
      .domain::before{content:'';width:34px;height:1px;background:rgba(250,247,240,.5)}
    </style>
    <div class="accent-rule"></div>
    <div class="kicker">${p.kicker}</div>
    <h2>${p.headline}</h2>
    <div class="domain">${p.domain}</div>`,

  // ===== B · SPLIT — photo top 55%, cream editorial panel with CTA row =====
  B: (p) => `
    <style>${BASE_CSS}
      body{background:var(--cream);display:flex;flex-direction:column}
      .photo{height:55%;background:url('${p.photo}') center/cover no-repeat;
             box-shadow:inset 0 -40px 60px -50px rgba(30,36,31,.45)}
      .panel{flex:1;padding:74px 90px 66px;display:flex;flex-direction:column}
      .txt{margin:auto 0}
      .kicker{color:var(--tan);margin-bottom:24px}
      h2{font-size:80px;line-height:1.16;color:var(--ink)}
      h2 em{color:var(--tan)}
      .rule{height:2px;background:var(--sage);margin-bottom:24px}
      .bottom{display:flex;justify-content:space-between;align-items:center}
      .domain{color:var(--sage-deep)}
      .cta{font-family:'Montserrat',sans-serif;font-weight:700;font-size:24px;
           letter-spacing:.18em;text-transform:uppercase;color:var(--tan)}
    </style>
    <div class="photo"></div>
    <div class="panel">
      <div class="txt">
        <div class="kicker">${p.kicker}</div>
        <h2>${p.headline}</h2>
      </div>
      <div class="cta-row">
        <div class="rule"></div>
        <div class="bottom">
          <div class="domain">${p.domain}</div>
          <div class="cta">Read&nbsp;→</div>
        </div>
      </div>
    </div>`,

  // ===== C · FRAMED — cream canvas, double sage frame, centered =====
  C: (p) => `
    <style>${BASE_CSS}
      body{background:var(--cream);padding:50px}
      .frame{height:100%;border:4px solid var(--sage);outline:1px solid var(--sage);
             outline-offset:10px;display:flex;flex-direction:column;align-items:center;
             text-align:center;padding:104px 70px 84px}
      .kicker{color:var(--tan);margin-bottom:28px;display:flex;align-items:center;gap:20px}
      .kicker::before,.kicker::after{content:'';width:30px;height:1px;background:var(--tan)}
      h2{font-size:82px;line-height:1.18;color:var(--ink);margin-bottom:64px}
      h2 em{color:var(--tan)}
      .photo{width:80%;flex:1;border-radius:18px;margin-bottom:60px;
             background:url('${p.photo}') center/cover no-repeat;
             box-shadow:0 24px 50px -28px rgba(30,36,31,.4)}
      .domain{color:var(--sage-deep)}
    </style>
    <div class="frame">
      <div class="kicker">${p.kicker}</div>
      <h2>${p.headline}</h2>
      <div class="photo"></div>
      <div class="domain">${p.domain}</div>
    </div>`,
};

// --ig renders Instagram's native 4:5 feed size (1080x1350) instead of
// Pinterest's 2:3 (1000x1500), reusing the same templates — the CSS is
// mostly flex-based and aspect-agnostic, so only the canvas size changes.
const IS_IG = process.argv.includes('--ig');
const pinsArg = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'pins.json';
const [W, H] = IS_IG ? [1080, 1350] : [1000, 1500];
const OUT_DIR = IS_IG ? 'out-instagram' : 'out';
const SUFFIX = IS_IG ? '-ig' : '';
const SIZE_OVERRIDE = `<style>html,body{width:${W}px !important;height:${H}px !important}</style>`;

const pins = JSON.parse(readFileSync(pinsArg, 'utf8'));
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: W, height: H } });

for (const pin of pins) {
  const photo = pin.photo.startsWith('http') ? pin.photo : pathToFileURL(resolve(pin.photo)).href;
  const html = `<!doctype html><html><head><meta charset="utf-8">${FONTS}</head><body>` +
    templates[pin.template]({ ...pin, photo }) + SIZE_OVERRIDE + '</body></html>';
  const file = resolve(`${OUT_DIR}/${pin.slug}-${pin.template}${SUFFIX}.html`);
  writeFileSync(file, html);
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${OUT_DIR}/${pin.slug}-${pin.template}${SUFFIX}.png` });
  console.log(`✓ ${OUT_DIR}/${pin.slug}-${pin.template}${SUFFIX}.png`);
}
await browser.close();
