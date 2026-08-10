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

  // ===== D · FLOATING CARD — bright full photo, inset rounded card lifts off it =====
  // Distinct silhouette from A/B/C: no dark scrim, no hard split, no museum frame --
  // a soft cream card with rounded corners floats over the lower third with margin
  // on every side, so the photo reads bright/airy above it. Sage pill kicker badge
  // instead of a bare uppercase line, for a more modern/social feel.
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

  // ===== E · TAPED POLAROID — scrapbook feel, photo taped in at a tilt on textured paper =====
  E: (p) => `
    <style>${BASE_CSS}
      body{background:
            radial-gradient(circle at 15% 20%, rgba(168,132,92,.08), transparent 40%),
            repeating-linear-gradient(0deg, rgba(30,36,31,.025) 0px, rgba(30,36,31,.025) 1px, transparent 1px, transparent 3px),
            var(--cream);
           display:flex;flex-direction:column;align-items:center;padding:80px 70px 64px}
      .kicker{color:var(--tan);margin-bottom:18px}
      .polaroid{position:relative;margin-top:20px;background:#fff;padding:28px 28px 100px;
                transform:rotate(2deg);box-shadow:0 30px 60px -20px rgba(30,36,31,.4);width:760px}
      .polaroid img{width:100%;height:560px;object-fit:cover;display:block}
      .polaroid .photo-el{width:100%;height:560px;background:url('${p.photo}') center/cover no-repeat}
      .tape{position:absolute;width:150px;height:56px;background:rgba(201,168,124,.55);
            border:1px solid rgba(168,132,92,.35);box-shadow:0 4px 10px rgba(0,0,0,.12)}
      .tape.l{top:-26px;left:-22px;transform:rotate(-30deg)}
      .tape.r{top:-26px;right:-22px;transform:rotate(26deg)}
      h2{font-size:66px;line-height:1.16;color:var(--ink);margin-top:46px;text-align:center}
      h2 em{color:var(--tan)}
      .domain{color:var(--sage-deep);margin-top:auto;padding-top:36px}
    </style>
    <div class="kicker">${p.kicker}</div>
    <div class="polaroid">
      <div class="tape l"></div>
      <div class="tape r"></div>
      <div class="photo-el"></div>
    </div>
    <h2>${p.headline}</h2>
    <div class="domain">${p.domain}</div>`,

  // ===== F · PRICE TAG — hanging kraft price-tag + torn banner headline =====
  F: (p) => `
    <style>${BASE_CSS}
      body{background:var(--ink)}
      .photo{position:absolute;inset:0;background:url('${p.photo}') center/cover no-repeat;opacity:.92}
      .darken{position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(20,26,18,.08) 0%, rgba(20,26,18,.08) 55%, rgba(14,18,12,.6) 100%)}
      .string{position:absolute;top:0;left:180px;width:4px;height:120px;
              background:repeating-linear-gradient(180deg,#EDE3CC 0 12px,transparent 12px 20px)}
      .tag{position:absolute;top:100px;left:70px;width:340px;background:var(--tan-light);
          border:3px solid var(--tan);border-radius:16px;padding:32px 34px 34px;
          transform:rotate(-7deg);box-shadow:0 22px 44px rgba(0,0,0,.32)}
      .tag::before{content:'';position:absolute;top:22px;left:28px;width:20px;height:20px;
                  border-radius:50%;background:var(--cream);border:3px solid var(--tan)}
      .tag .kicker{color:var(--ink);margin-left:26px;font-size:22px;letter-spacing:.24em}
      .banner-wrap{position:absolute;left:0;right:0;bottom:120px}
      .banner{background:var(--cream);margin:0 -20px;padding:44px 90px 38px;position:relative;
              box-shadow:0 -14px 40px rgba(0,0,0,.22)}
      .banner::before,.banner::after{content:'';position:absolute;bottom:-22px;width:0;height:0;
              border-left:22px solid transparent;border-right:22px solid transparent;
              border-top:22px solid var(--tan)}
      .banner::before{left:0}
      .banner::after{right:0;transform:scaleX(-1)}
      h2{font-size:70px;line-height:1.16;color:var(--ink);text-align:center}
      h2 em{color:var(--tan)}
      .domain{position:absolute;left:0;right:0;bottom:36px;text-align:center;color:rgba(250,247,240,.85)}
    </style>
    <div class="photo"></div>
    <div class="darken"></div>
    <div class="string"></div>
    <div class="tag"><div class="kicker">${p.kicker}</div></div>
    <div class="banner-wrap"><div class="banner"><h2>${p.headline}</h2></div></div>
    <div class="domain">${p.domain}</div>`,

  // ===== G · ARCHWAY — photo through an architectural arch, ribbon-banner headline =====
  G: (p) => `
    <style>${BASE_CSS}
      body{background:var(--sage-deep);display:flex;flex-direction:column;align-items:center}
      .plaque{margin-top:70px;background:var(--tan-light);color:var(--ink);padding:16px 40px;
             border-radius:8px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:24px;
             letter-spacing:.22em;text-transform:uppercase}
      .arch{margin-top:48px;width:680px;height:820px;border-radius:340px 340px 20px 20px;
            overflow:hidden;border:14px solid var(--cream);box-shadow:0 34px 70px rgba(0,0,0,.4);
            background:url('${p.photo}') center/cover no-repeat}
      .ribbon-wrap{margin-top:-56px;width:800px;position:relative}
      .ribbon{background:var(--cream);padding:44px 60px 38px;text-align:center;
             box-shadow:0 20px 46px rgba(0,0,0,.32);position:relative}
      .ribbon::before,.ribbon::after{content:'';position:absolute;top:0;border-style:solid}
      .ribbon::before{left:-40px;border-width:36px 40px 36px 0;
             border-color:transparent #E5DCC5 transparent transparent}
      .ribbon::after{right:-40px;border-width:36px 0 36px 40px;
             border-color:transparent transparent transparent #E5DCC5}
      h2{font-size:66px;line-height:1.16;color:var(--ink)}
      h2 em{color:var(--tan)}
      .domain{margin-top:auto;margin-bottom:56px;color:rgba(250,247,240,.8)}
    </style>
    <div class="plaque">${p.kicker}</div>
    <div class="arch"></div>
    <div class="ribbon-wrap"><div class="ribbon"><h2>${p.headline}</h2></div></div>
    <div class="domain">${p.domain}</div>`,
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
// deviceScaleFactor: 2 renders at retina (2x) pixel density — e.g. a 1000x1500
// pin outputs as a 2000x3000 PNG, sharp on high-DPI displays and Pinterest's
// own upscaling, instead of the previous 1x (1000x1500 native) renders.
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });

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
