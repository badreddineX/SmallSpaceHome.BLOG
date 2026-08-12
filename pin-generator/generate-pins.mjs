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
  .kicker,.eyebrow{font-family:'Montserrat',sans-serif;font-weight:700;font-size:28px;
          letter-spacing:.30em;text-transform:uppercase}
  .domain{font-family:'Montserrat',sans-serif;font-weight:600;font-size:25px;
          letter-spacing:.24em;text-transform:uppercase}
  h2{font-family:'Playfair Display',serif;font-weight:600}
  h2 em{font-style:italic}
  .subtitle{font-family:'Montserrat',sans-serif;font-weight:600;font-size:30px;
            line-height:1.3}
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

  // ===== D · TAPED POLAROID (Final) — kraft/olive/rust palette, scrapbook feel =====
  // Replaces the retired Floating Card template. Ported from the approved
  // "Decor Pin Templates D/E/F (Final)" artifact — see pin-generator README.
  D: (p) => `
    <style>${BASE_CSS}
      :root{ --k-ink:#1E2A22; --k-cream:#F7F2E7; --k-paper:#EFE7D6; --k-kraft:#D9C9A3;
             --k-kraft-dark:#B89F6E; --k-olive-deep:#4C5738; --k-rust:#A85C3C; }
      body{background:
            radial-gradient(circle at 15% 20%, rgba(180,129,63,.06), transparent 40%),
            repeating-linear-gradient(0deg, rgba(30,42,34,.025) 0px, rgba(30,42,34,.025) 1px, transparent 1px, transparent 3px),
            var(--k-paper);
           display:flex;flex-direction:column;align-items:center;padding:88px 76px 64px}
      .eyebrow{color:var(--k-rust)}
      .handwritten{font-family:'Bradley Hand','Segoe Print','Comic Sans MS',cursive;
            color:var(--k-olive-deep);font-size:44px;margin:28px 0 8px;transform:rotate(-1.5deg)}
      .polaroid{position:relative;margin:36px auto 0;background:#fff;padding:34px 34px 128px;
                transform:rotate(2deg);box-shadow:0 30px 60px -20px rgba(15,26,18,.3);width:760px}
      .polaroid .photo-el{width:100%;height:640px;background:url('${p.photo}') center/cover no-repeat}
      .tape{position:absolute;width:150px;height:56px;background:rgba(212,197,150,.75);
            border:1px solid rgba(180,129,63,.35);box-shadow:0 4px 10px rgba(0,0,0,.12)}
      .tape.l{top:-26px;left:-22px;transform:rotate(-30deg)}
      .tape.r{top:-26px;right:-22px;transform:rotate(26deg)}
      h2{font-size:72px;line-height:1.16;color:var(--k-ink);margin-top:56px;text-align:center}
      h2 em{color:var(--k-rust)}
      .domain{color:var(--k-olive-deep);margin-top:auto;padding-top:40px}
    </style>
    <div class="eyebrow">${p.kicker}</div>
    <div class="handwritten">${p.handwritten || ''}</div>
    <div class="polaroid">
      <div class="tape l"></div>
      <div class="tape r"></div>
      <div class="photo-el"></div>
    </div>
    <h2>${p.headline}</h2>
    <div class="domain">${p.domain}</div>`,

  // ===== E · PRICE TAG (Final) — kraft/rust hanging tag with No.## pill =====
  E: (p) => `
    <style>${BASE_CSS}
      :root{ --k-ink:#1E2A22; --k-cream:#F7F2E7; --k-kraft:#D9C9A3; --k-kraft-dark:#B89F6E;
             --k-rust:#A85C3C; }
      body{background:var(--k-ink)}
      .photo{position:absolute;inset:0;background:url('${p.photo}') center/cover no-repeat;opacity:.92}
      .darken{position:absolute;inset:0;background:
              linear-gradient(180deg, rgba(20,26,18,.05) 0%, rgba(20,26,18,.05) 55%, rgba(14,18,12,.55) 100%)}
      .string{position:absolute;top:0;left:270px;width:4px;height:135px;
              background:repeating-linear-gradient(180deg,#EDE3CC 0 15px,transparent 15px 27px)}
      .tag{position:absolute;top:124px;left:100px;width:435px;background:var(--k-kraft);
          border:4px solid var(--k-kraft-dark);border-radius:24px;padding:42px 48px 48px;
          transform:rotate(-7deg);box-shadow:0 30px 60px rgba(0,0,0,.3)}
      .tag::before{content:'';position:absolute;top:30px;left:42px;width:26px;height:26px;
                  border-radius:50%;background:var(--k-cream);border:4px solid var(--k-kraft-dark)}
      .tag .eyebrow{color:var(--k-rust);margin-left:36px}
      .tag .no{font-family:Georgia,serif;font-weight:700;font-size:100px;color:var(--k-ink);
               margin:12px 0 0 36px;line-height:1}
      .tag .no span{color:var(--k-rust);font-size:52px}
      .banner-wrap{position:absolute;left:0;right:0;bottom:135px}
      .banner{background:var(--k-kraft);margin:0 -24px;padding:48px 90px 42px;position:relative;
              box-shadow:0 -18px 60px rgba(0,0,0,.2)}
      .banner::before,.banner::after{content:'';position:absolute;bottom:-27px;width:0;height:0;
              border-left:30px solid transparent;border-right:30px solid transparent;
              border-top:27px solid var(--k-kraft-dark)}
      .banner::before{left:0}
      .banner::after{right:0;transform:scaleX(-1)}
      h2{font-size:68px;line-height:1.16;color:var(--k-ink);text-align:center}
      h2 em{color:var(--k-rust)}
      .domain{position:absolute;left:0;right:0;bottom:42px;text-align:center;color:rgba(247,242,231,.85)}
    </style>
    <div class="photo"></div>
    <div class="darken"></div>
    <div class="string"></div>
    <div class="tag">
      <div class="eyebrow">${p.kicker}</div>
      ${p.number ? `<div class="no">No.<span>${p.number}</span></div>` : ''}
    </div>
    <div class="banner-wrap"><div class="banner"><h2>${p.headline}</h2></div></div>
    <div class="domain">${p.domain}</div>`,

  // ===== F · ARCHWAY (Final) — olive/gold plaque, arch photo, ribbon banner =====
  F: (p) => `
    <style>${BASE_CSS}
      :root{ --k-ink:#1E2A22; --k-cream:#F7F2E7; --k-paper:#EFE7D6; --k-olive-deep:#4C5738;
             --k-gold:#B4813F; }
      body{background:var(--k-olive-deep);display:flex;flex-direction:column;align-items:center}
      .plaque{margin-top:88px;background:var(--k-gold);color:var(--k-ink);padding:16px 40px;
             border-radius:8px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:24px;
             letter-spacing:.22em;text-transform:uppercase}
      .arch{margin-top:58px;width:680px;height:868px;border-radius:340px 340px 24px 24px;
            overflow:hidden;border:18px solid var(--k-cream);box-shadow:0 34px 70px rgba(0,0,0,.4);
            background:url('${p.photo}') center/cover no-repeat}
      .ribbon-wrap{margin-top:-70px;width:820px;position:relative}
      .ribbon{background:var(--k-cream);padding:48px 60px 42px;text-align:center;
             box-shadow:0 20px 46px rgba(0,0,0,.32);position:relative}
      .ribbon::before,.ribbon::after{content:'';position:absolute;top:0;border-style:solid}
      .ribbon::before{left:-46px;border-width:44px 46px 44px 0;
             border-color:transparent var(--k-paper) transparent transparent;filter:brightness(.88)}
      .ribbon::after{right:-46px;border-width:44px 0 44px 46px;
             border-color:transparent transparent transparent var(--k-paper);filter:brightness(.88)}
      h2{font-size:64px;line-height:1.16;color:var(--k-ink)}
      h2 em{color:var(--k-gold)}
      .domain{margin-top:auto;margin-bottom:64px;color:rgba(247,242,231,.75)}
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
