// Pinterest pin generator for smallspacehome.ca — v3 "Hormozi" edition
// A = Full-Bleed · B = Split · C = Framed · D = Floating Card · E = Bold List (no photo)
// Template E is text-dominant, no photo required — Hormozi scroll-stopper format.
// Headlines support <em>word</em> → italic accent in tan.
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

  // ===== D · FLOATING CARD — bright full photo, inset rounded card lifts off it =====
  D: (p) => `
    <style>${BASE_CSS}
      body{background:var(--cream)}
      .photo{position:absolute;inset:0;background:url('${p.photo}') center/cover no-repeat}
      .scrim-top{position:absolute;top:0;left:0;right:0;height:40%;
                 background:linear-gradient(180deg, rgba(20,26,18,.28) 0%, rgba(20,26,18,0) 100%)}
      .card{position:absolute;left:56px;right:56px;bottom:56px;background:var(--cream);
            border-radius:28px;padding:64px 60px 54px;
            box-shadow:0 30px 60px -22px rgba(30,36,31,.35)}
      .pill{display:inline-flex;align-items:center;background:var(--sage-deep);color:var(--cream);
            font-family:'Montserrat',sans-serif;font-weight:700;font-size:23px;
            letter-spacing:.16em;text-transform:uppercase;padding:12px 28px;
            border-radius:999px;margin-bottom:32px}
      h2{font-size:74px;line-height:1.16;color:var(--ink);margin-bottom:36px}
      h2 em{color:var(--tan)}
      .rule{width:56px;height:3px;background:var(--tan-light);margin-bottom:22px}
      .domain{color:var(--sage-deep)}
    </style>
    <div class="photo"></div>
    <div class="scrim-top"></div>
    <div class="card">
      <div class="pill">${p.kicker}</div>
      <h2>${p.headline}</h2>
      <div class="rule"></div>
      <div class="domain">${p.domain}</div>
    </div>`,

  // ===== E · BOLD LIST — dark canvas, massive Hormozi-style numbered teaser list =====
  // Text-dominant — no photo required. Supply p.list[] with 3–7 short teaser strings.
  // Curiosity gap: viewers see enough to want more, but must click to get the rest.
  E: (p) => `
    <style>${BASE_CSS}
      body{background:var(--ink);display:flex;flex-direction:column;
           padding:96px 90px 88px;position:relative;overflow:hidden}
      .bg-glow{position:absolute;width:820px;height:820px;border-radius:50%;
               background:radial-gradient(circle, rgba(74,90,68,.26) 0%, transparent 68%);
               top:-260px;right:-240px;pointer-events:none}
      .top-bar{display:flex;align-items:center;gap:22px;margin-bottom:58px;flex-shrink:0}
      .top-bar::after{content:'';flex:1;height:1px;background:rgba(201,168,124,.32)}
      .kicker{font-family:'Montserrat',sans-serif;font-weight:700;font-size:23px;
              letter-spacing:.28em;text-transform:uppercase;color:var(--tan-light);white-space:nowrap}
      h2{font-family:'Playfair Display',serif;font-weight:600;font-size:96px;
         line-height:1.10;color:var(--cream);margin-bottom:56px;flex-shrink:0;
         text-shadow:0 4px 36px rgba(0,0,0,.4)}
      h2 em{color:var(--tan-light);font-style:italic}
      .list{flex:1;list-style:none;display:flex;flex-direction:column;
            justify-content:space-evenly;padding-bottom:8px}
      .list li{display:flex;align-items:flex-start;gap:24px}
      .num{font-family:'Playfair Display',serif;font-size:44px;font-weight:700;
           color:var(--tan-light);min-width:54px;line-height:1;flex-shrink:0}
      .item-txt{font-family:'Montserrat',sans-serif;font-weight:600;font-size:29px;
                line-height:1.38;color:rgba(250,247,240,.84);padding-top:5px}
      .footer{display:flex;align-items:center;justify-content:space-between;
              padding-top:44px;border-top:1px solid rgba(201,168,124,.26);flex-shrink:0}
      .domain{font-family:'Montserrat',sans-serif;font-weight:600;font-size:22px;
              letter-spacing:.22em;text-transform:uppercase;color:rgba(250,247,240,.55)}
      .cta-badge{background:var(--tan);color:var(--cream);font-family:'Montserrat',sans-serif;
                 font-weight:700;font-size:20px;letter-spacing:.14em;text-transform:uppercase;
                 padding:13px 28px;border-radius:999px}
    </style>
    <div class="bg-glow"></div>
    <div class="top-bar"><div class="kicker">${p.kicker}</div></div>
    <h2>${p.headline}</h2>
    <ul class="list">
      ${(p.list || []).map((item, i) =>
        `<li><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="item-txt">${item}</span></li>`
      ).join('\n      ')}
    </ul>
    <div class="footer">
      <div class="domain">${p.domain}</div>
      <div class="cta-badge">Read&nbsp;→</div>
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
// deviceScaleFactor: 2 renders at retina density — 2000×3000 output, sharp on hi-DPI screens.
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });

for (const pin of pins) {
  const photo = pin.photo
    ? (pin.photo.startsWith('http') ? pin.photo : pathToFileURL(resolve(pin.photo)).href)
    : '';
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
