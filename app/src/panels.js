// Layouts and export sizes for the cover. A layout splits the area above
// the title band into panels; the band always holds the title and subtitle.

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  landscape: { w: 1920, h: 1080, label: '1920 × 1080' },
};

export const LAYOUTS = {
  hero: { label: 'Hero + 2 panels', panels: 3 },
  grid: { label: 'Four panels', panels: 4 },
  single: { label: 'One photo', panels: 1 },
};

/** Preview canvas size for each export size, so the live preview keeps its shape. */
export const PREVIEW = {
  square: { w: 900, h: 900 },
  portrait: { w: 720, h: 900 },
  landscape: { w: 960, h: 540 },
};

/**
 * Returns { panels: [{x,y,w,h}], band: {x,y,w,h} } for a layout at W x H.
 * Panels sit above the title band, separated by gutters that show the sky.
 */
export function layoutRects(layout, w, h) {
  const bandH = Math.round(h * 0.22);
  const g = Math.max(6, Math.round(w * 0.012));
  const area = { x: g, y: g, w: w - g * 2, h: h - bandH - g * 2 };
  const band = { x: 0, y: h - bandH, w, h: bandH };
  let panels;
  if (layout === 'single') {
    panels = [{ ...area }];
  } else if (layout === 'grid') {
    const cw = (area.w - g) / 2;
    const ch = (area.h - g) / 2;
    panels = [
      { x: area.x, y: area.y, w: cw, h: ch },
      { x: area.x + cw + g, y: area.y, w: cw, h: ch },
      { x: area.x, y: area.y + ch + g, w: cw, h: ch },
      { x: area.x + cw + g, y: area.y + ch + g, w: cw, h: ch },
    ];
  } else {
    // hero: a big panel on the left, two stacked panels on the right.
    const heroW = Math.round(area.w * 0.62);
    const sideW = area.w - heroW - g;
    const sideH = (area.h - g) / 2;
    panels = [
      { x: area.x, y: area.y, w: heroW, h: area.h },
      { x: area.x + heroW + g, y: area.y, w: sideW, h: sideH },
      { x: area.x + heroW + g, y: area.y + sideH + g, w: sideW, h: sideH },
    ];
  }
  return { panels, band };
}

/** Finds which panel (index) holds point (x, y), or -1 when it holds none. */
export function panelAt(rects, x, y) {
  return rects.panels.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
}
