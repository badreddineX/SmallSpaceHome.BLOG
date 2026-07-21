// Pinterest/Instagram "short" generator for smallspacehome.ca
// Renders a 1080x1920, ~18s vertical slideshow: 4 photos with slow Ken-Burns
// zoom, branded headline overlay (first 2.5s), domain line overlay (last 2s).
// Matches the static pins' palette/fonts (Georgia stands in for Playfair
// Display, Arial Bold for Montserrat/Inter — same fallback stack as the site
// CSS already uses).
//
// Usage: node generate-short.mjs shorts.json
// shorts.json: [{ "slug": "...", "kicker": "...", "headline": "...",
//                 "domain": "smallspacehome.ca", "photos": ["./public/images/a.jpg", ... 3-4 photos] }]

import { execFileSync } from 'child_process';
import { readFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { resolve, join } from 'path';

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FONT_HEADLINE = 'C\\:/Windows/Fonts/georgiab.ttf';
const FONT_SANS = 'C\\:/Windows/Fonts/arialbd.ttf';

const W = 1080, H = 1920, FPS = 25;
const PER_PHOTO_SEC = 4.5; // 4 photos * 4.5s = 18s total

const INK = '0x1C1917';
const TAN = '0xC9A87C';
const CREAM = '0xFAFAF7';

function letterSpace(s) {
  // crude letter-spacing simulation for uppercase kicker/domain text in drawtext
  return s.split('').join(' ');
}

function wrapHeadline(text, maxCharsPerLine = 20) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxCharsPerLine && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2); // cap at 2 lines for a short's smaller safe area
}

function escText(s) {
  return s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "’");
}

const shorts = JSON.parse(readFileSync(process.argv[2] ?? 'shorts.json', 'utf8'));
const workDir = resolve('short-work');
const outDir = resolve('out-shorts');
mkdirSync(outDir, { recursive: true });

for (const s of shorts) {
  const photos = s.photos.slice(0, 4);
  if (photos.length < 3) {
    console.error(`✗ ${s.slug}: needs 3-4 photos, got ${photos.length}`);
    continue;
  }

  if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  // Step 1: per-photo Ken Burns clip, cropped/scaled to 1080x1920 portrait
  const clipPaths = [];
  photos.forEach((photo, i) => {
    const src = resolve(photo);
    const clip = join(workDir, `clip${i}.mp4`);
    const totalFrames = Math.round(PER_PHOTO_SEC * FPS);
    const zoomExpr = i % 2 === 0
      ? `min(zoom+0.0012,1.12)`   // zoom in
      : `if(eq(on,1),1.12,max(zoom-0.0012,1.0))`; // zoom out
    const vf = [
      `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase`,
      `crop=${W * 2}:${H * 2}`,
      `zoompan=z='${zoomExpr}':d=${totalFrames}:s=${W}x${H}:fps=${FPS}`,
      `format=yuv420p`,
    ].join(',');
    execFileSync(FFMPEG, [
      '-y', '-loop', '1', '-i', src,
      '-vf', vf,
      '-t', String(PER_PHOTO_SEC),
      '-r', String(FPS),
      clip,
    ], { stdio: 'inherit' });
    clipPaths.push(clip);
  });

  // Step 2: concat clips
  const listFile = join(workDir, 'list.txt');
  const listContent = clipPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
  writeListFile(listFile, listContent);
  const baseVideo = join(workDir, 'base.mp4');
  execFileSync(FFMPEG, [
    '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c', 'copy', baseVideo,
  ], { stdio: 'inherit' });

  // Step 3: overlay branded text (kicker + headline fade in/out at start,
  // bottom scrim + domain line at the end) and mux silent audio track isn't
  // needed — Pinterest/IG accept silent MP4s for slideshow-style shorts.
  const kicker = letterSpace(s.kicker.toUpperCase());
  const domain = letterSpace(s.domain.toUpperCase());
  const headlineLines = wrapHeadline(s.headline);

  const introEnd = 2.5;
  const outroStart = PER_PHOTO_SEC * photos.length - 2.0;

  const scrimTop = `drawbox=x=0:y=0:w=${W}:h=${H}:color=${INK}@0.0:t=fill:enable='between(t,0,0)'`; // no-op placeholder kept for clarity

  const introAlpha = `if(lt(t,0.3),t/0.3,if(gt(t,${introEnd - 0.3}),max(0,(${introEnd}-t)/0.3),1))`;
  const outroAlpha = `if(lt(t,${outroStart}),0,if(lt(t,${outroStart + 0.3}),(t-${outroStart})/0.3,1))`;

  const filters = [];
  // dark scrim behind intro text (top-anchored, like Layout A's gradient)
  filters.push(
    `drawbox=x=0:y=0:w=${W}:h=520:color=${INK}@0.55:t=fill:enable='between(t,0,${introEnd})'`
  );
  // kicker
  filters.push(
    `drawtext=fontfile='${FONT_SANS}':text='${escText(kicker)}':fontsize=30:fontcolor=${TAN}:` +
    `x=(w-text_w)/2:y=140:alpha='${introAlpha}'`
  );
  // headline (up to 2 lines), each its own drawtext stacked
  headlineLines.forEach((line, i) => {
    filters.push(
      `drawtext=fontfile='${FONT_HEADLINE}':text='${escText(line)}':fontsize=64:fontcolor=white:` +
      `x=(w-text_w)/2:y=${200 + i * 76}:alpha='${introAlpha}'`
    );
  });
  // outro scrim + domain line
  filters.push(
    `drawbox=x=0:y=${H - 220}:w=${W}:h=220:color=${INK}@0.6:t=fill:enable='gte(t,${outroStart})'`
  );
  filters.push(
    `drawtext=fontfile='${FONT_SANS}':text='${escText(domain)}':fontsize=32:fontcolor=${CREAM}:` +
    `x=(w-text_w)/2:y=${H - 130}:alpha='${outroAlpha}'`
  );

  const outFile = join(outDir, `${s.slug}-short.mp4`);
  execFileSync(FFMPEG, [
    '-y', '-i', baseVideo,
    '-vf', filters.join(','),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    outFile,
  ], { stdio: 'inherit' });

  rmSync(workDir, { recursive: true, force: true });
  console.log(`✓ ${outFile}`);
}

function writeListFile(path, content) {
  execFileSync('node', ['-e', `require('fs').writeFileSync(${JSON.stringify(path)}, ${JSON.stringify(content)})`]);
}
