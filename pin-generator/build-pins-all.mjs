import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { loadPosts } from './posts-auto.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'pinterest-pins');
mkdirSync(OUT, { recursive: true });
const TMP = process.env.TEMP || '/tmp';
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };
const img = (n) => { const p = resolve(ROOT, 'public/images', n); const b = readFileSync(p); const m = MIME[extname(n).toLowerCase()] || 'image/jpeg'; return `data:${m};base64,${b.toString('base64')}`; };
const POSTS = loadPosts(ROOT).map((p) => ({ ...p, photo: img(p.photo) }));
const fit = (t, big) => { const n = t.length; return n <= 16 ? big : n <= 24 ? Math.round(big * .9) : Math.round(big * .78); };
const C = { blue: '#1B3A4B', cream: '#F5F1EB', teal: '#2B7A78', gold: '#C9A96E' };
const HEAD = `<meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1000px;height:1500px;overflow:hidden;font-family:'Inter',Arial,sans-serif}
.h{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.05}.ph{background-size:cover;background-position:center}</style>`;

const A = (p) => `${HEAD}<style>.ph{position:absolute;inset:0}.frame{position:absolute;inset:30px;border:2px solid rgba(255,255,255,.85)}
.card{position:absolute;left:80px;right:80px;bottom:110px;background:${C.cream};padding:48px 52px;text-align:center}
.k{color:${C.teal};font-weight:800;font-size:24px;letter-spacing:.3em}.h{font-size:${fit(p.title, 96)}px;color:${C.blue};margin-top:16px}
.s{margin-top:20px;font-weight:600;font-size:32px;color:#4a5568;letter-spacing:.04em}.dom{position:absolute;left:0;right:0;bottom:56px;text-align:center;color:#fff;font-weight:700;font-size:20px;letter-spacing:.3em;text-shadow:0 2px 10px rgba(0,0,0,.6)}</style>
<div class="ph" style="background-image:url('${p.photo}')"></div><div class="frame"></div>
<div class="card"><div class="k">${p.kicker}</div><div class="h">${p.title}</div><div class="s">${p.num ? p.num + ' ' : ''}${p.sub}</div></div><div class="dom">SMALLSPACEHOME.CA</div>`;

const B = (p) => `${HEAD}<style>body{background:${C.blue}}.ph{position:absolute;left:0;top:0;width:1000px;height:880px}
.num{position:absolute;right:50px;top:740px;width:210px;height:210px;border-radius:50%;background:${C.gold};color:${C.blue};display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.num b{font-size:${p.num && p.num.length > 2 ? 76 : 100}px;line-height:1}.num i{font-style:normal;font-size:22px;letter-spacing:.2em}
.blk{position:absolute;left:0;top:880px;width:1000px;height:620px;padding:120px 66px 0;color:#fff}
.k{color:${C.gold};font-weight:800;font-size:26px;letter-spacing:.28em}.h{font-size:${fit(p.title, 104)}px;margin-top:14px}.s{margin-top:22px;font-size:34px;font-weight:600;opacity:.85}
.dom{position:absolute;left:0;right:0;bottom:40px;text-align:center;color:${C.gold};font-weight:700;font-size:20px;letter-spacing:.3em}</style>
<div class="ph" style="background-image:url('${p.photo}')"></div><div class="num"><b>${p.num || '✦'}</b><i>${p.unit.toUpperCase()}</i></div>
<div class="blk"><div class="k">${p.kicker}</div><div class="h">${p.title}</div><div class="s">${p.sub}</div></div><div class="dom">SMALLSPACEHOME.CA</div>`;

const Cc = (p) => `${HEAD}<style>body{background:${C.cream}}.fr{position:absolute;left:70px;top:70px;width:860px;height:880px;padding:16px;background:#fff;box-shadow:0 16px 46px rgba(27,58,75,.22)}
.fr .ph{width:100%;height:100%}.rule{position:absolute;left:70px;right:70px;top:990px;height:2px;background:${C.teal}}
.txt{position:absolute;left:90px;right:90px;top:1020px}.k{color:${C.teal};font-weight:800;font-size:24px;letter-spacing:.3em}
.h{font-size:${fit(p.title, 92)}px;color:${C.blue};margin-top:14px}.s{margin-top:18px;font-weight:600;font-size:30px;color:#4a5568}
.dom{position:absolute;left:0;right:0;bottom:48px;text-align:center;color:${C.teal};font-weight:700;font-size:20px;letter-spacing:.3em}</style>
<div class="fr"><div class="ph" style="background-image:url('${p.photo}')"></div></div><div class="rule"></div>
<div class="txt"><div class="k">${p.kicker}</div><div class="h">${p.title}</div><div class="s">${p.num ? p.num + ' ' : ''}${p.sub}</div></div><div class="dom">SMALLSPACEHOME.CA</div>`;

const designs = [['A', A], ['B', B], ['C', Cc]];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
let count = 0;
for (const p of POSTS) {
  for (const [tag, fn] of designs) {
    const tmpFile = resolve(TMP, '_cad_pin.html');
    writeFileSync(tmpFile, `<!DOCTYPE html><html><head></head><body>${fn(p)}</body></html>`);
    await page.goto(pathToFileURL(tmpFile).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(OUT, `${p.slug}-${tag}.png`), type: 'png' });
    count++;
  }
}
rmSync(resolve(TMP, '_cad_pin.html'), { force: true });
await browser.close();
console.log(`done ${POSTS.length} posts x ${designs.length} designs = ${count} pins`);
