// Draws a Vice City cover: sky, photo panels with the grade wash, a title
// band with bold system-font lettering, palm silhouettes, halftone dots,
// scanlines and a vignette. Lettering uses the system Arial Black / Impact
// stack only — no font files, no game fonts.

import { GRADES, paintSky, washPanel } from './grades.js';
import { drawPalm, drawPalmCluster } from './palms.js';
import { layoutRects } from './panels.js';

const TITLE_FONT = '"Arial Black", Impact, "Helvetica Neue", sans-serif';
const BODY_FONT = '"Arial Black", Impact, sans-serif';

/** Shrinks `text` until it fits `maxW` at `start` px, returning the size. */
export function fitTitleSize(ctx, text, maxW, start) {
  let size = start;
  ctx.font = `${size}px ${TITLE_FONT}`;
  while (size > 12 && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `${size}px ${TITLE_FONT}`;
  }
  return size;
}

/** Draws one photo into a panel rect, cover-fit, with zoom and pan offsets. */
export function drawPhotoPanel(ctx, img, rect, zoom, ox, oy) {
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = base * Math.max(1, zoom);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const maxOx = Math.max(0, (dw - rect.w) / 2 / rect.w);
  const maxOy = Math.max(0, (dh - rect.h) / 2 / rect.h);
  const cx = rect.x + rect.w / 2 + Math.max(-maxOx, Math.min(maxOx, ox)) * rect.w;
  const cy = rect.y + rect.h / 2 + Math.max(-maxOy, Math.min(maxOy, oy)) * rect.h;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
}

/** Draws the placeholder shown in a panel that has no photo yet. */
export function drawEmptyPanel(ctx, rect, index) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, '#3a1c5e');
  grad.addColorStop(1, '#160a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `bold ${Math.max(14, rect.w * 0.05)}px ${BODY_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PANEL ${index + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2 - rect.h * 0.04);
  ctx.font = `${Math.max(11, rect.w * 0.03)}px sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2 + rect.h * 0.06);
  ctx.textBaseline = 'alphabetic';
}

/** Halftone dots fading down the title band, in the grade's accent colour. */
export function drawHalftone(ctx, band, accent) {
  const step = Math.max(10, band.h * 0.16);
  ctx.fillStyle = accent;
  for (let y = band.y + step * 0.4, row = 0; y < band.y + band.h * 0.55; y += step, row++) {
    for (let x = band.x + step / 2; x < band.x + band.w; x += step) {
      const r = Math.max(0.6, (step * 0.16 * (1 - row * 0.22)) / 2);
      ctx.globalAlpha = 0.5 - row * 0.12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** Faint horizontal scanlines across the whole cover. */
export function drawScanlines(ctx, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
  const step = Math.max(4, Math.round(h / 270));
  for (let y = 0; y < h; y += step * 2) ctx.fillRect(0, y, w, step);
}

/** Darkens the cover's corners so the middle pops. */
export function drawVignette(ctx, w, h) {
  const glow = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  glow.addColorStop(0, 'rgba(0, 0, 0, 0)');
  glow.addColorStop(1, 'rgba(10, 2, 25, 0.42)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draws the whole cover onto `ctx` at W x H from `state`:
 * { layout, grade, title, subtitle, photos, panels, palms, halftone,
 *   scanlines, vignette }. `photos` are HTMLImageElements (or null), and
 * `panels` are { photo, zoom, ox, oy } per panel, photo = index into photos.
 */
export function drawCover(ctx, w, h, state) {
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const { panels, band } = layoutRects(state.layout, w, h);
  paintSky(ctx, w, h, grade);

  // A low sun glow in the top-right corner, over the panels like a lens flare.
  const sun = ctx.createRadialGradient(w * 0.86, h * 0.06, 0, w * 0.86, h * 0.06, w * 0.30);
  sun.addColorStop(0, 'rgba(255, 220, 140, 0.55)');
  sun.addColorStop(0.35, 'rgba(255, 140, 80, 0.28)');
  sun.addColorStop(1, 'rgba(255, 140, 80, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  panels.forEach((rect, i) => {
    const panel = state.panels[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 };
    const img = state.photos[panel.photo] ?? null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (img) drawPhotoPanel(ctx, img, rect, panel.zoom, panel.ox, panel.oy);
    else drawEmptyPanel(ctx, rect, i);
    washPanel(ctx, rect, grade);
    ctx.restore();
    // Crisp white frame and a thin neon inner line around each panel.
    ctx.lineWidth = Math.max(2, w * 0.003);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.lineWidth = Math.max(1, w * 0.0012);
    ctx.strokeStyle = grade.accent;
    ctx.globalAlpha = 0.65;
    ctx.strokeRect(rect.x + w * 0.006, rect.y + w * 0.006, rect.w - w * 0.012, rect.h - w * 0.012);
    ctx.globalAlpha = 1;
  });

  // Title band: deep gradient, neon top edge, halftone, big title, subtitle.
  const bandGrad = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  bandGrad.addColorStop(0, grade.band[0]);
  bandGrad.addColorStop(1, grade.band[1]);
  ctx.fillStyle = bandGrad;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  ctx.fillStyle = grade.accent;
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = band.h * 0.18;
  ctx.fillRect(band.x, band.y, band.w, Math.max(3, band.h * 0.025));
  ctx.shadowBlur = 0;

  if (state.halftone) drawHalftone(ctx, band, grade.accent);

  const title = (state.title || 'VICE CITY').trim().toUpperCase();
  const titleSize = fitTitleSize(ctx, title, band.w * 0.86, band.h * 0.52);
  ctx.font = `${titleSize}px ${TITLE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = titleSize * 0.35;
  ctx.fillText(title, band.w / 2, band.y + band.h * 0.42);
  ctx.shadowBlur = 0;

  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (subtitle) {
    ctx.font = `bold ${Math.max(10, band.h * 0.115)}px ${BODY_FONT}`;
    try { ctx.letterSpacing = `${Math.max(2, band.h * 0.02)}px`; } catch { /* older canvas: ignore */ }
    ctx.fillStyle = grade.subtitle;
    ctx.fillText(subtitle, band.w / 2, band.y + band.h * 0.80);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas: ignore */ }
  }
  ctx.textBaseline = 'alphabetic';

  if (state.palms) {
    drawPalmCluster(ctx, band, 'rgba(12, 4, 26, 0.92)');
    drawPalm(ctx, w * 0.02, band.y + 2, band.h * 0.9, -0.12, 'rgba(12, 4, 26, 0.55)');
  }

  if (state.scanlines) drawScanlines(ctx, w, h);
  if (state.vignette) drawVignette(ctx, w, h);

  // Thin white poster edge around the whole cover.
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.strokeRect(w * 0.004, h * 0.004, w - w * 0.008, h - h * 0.008);
}
