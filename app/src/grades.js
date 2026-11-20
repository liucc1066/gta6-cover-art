// Colour grades for Vice City Cover Maker: every grade is a set of colours
// this app owns. A grade paints the sky behind the panels, the wash over
// each photo, the title band and the neon accent line.

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    sky: ['#2b1055', '#c2187b', '#ff5e3a', '#ffc46b'],
    wash: 'rgba(255, 94, 58, 0.24)',
    glow: '#ff2e88',
    band: ['#160a2e', '#7b1e5b'],
    accent: '#ffb347',
    subtitle: '#ffd9a0',
  },
  neon: {
    label: 'Neon Night',
    sky: ['#05021a', '#3b0f66', '#ff2e88', '#00e5ff'],
    wash: 'rgba(0, 229, 255, 0.20)',
    glow: '#00e5ff',
    band: ['#05021a', '#4a1066'],
    accent: '#00e5ff',
    subtitle: '#9ff3ff',
  },
  golden: {
    label: 'Golden Hour',
    sky: ['#3d1c4f', '#b83a5e', '#ff7b00', '#ffd166'],
    wash: 'rgba(255, 180, 60, 0.24)',
    glow: '#ff9a3d',
    band: ['#241031', '#8a2f4d'],
    accent: '#ffe066',
    subtitle: '#ffe9b0',
  },
  dusk: {
    label: 'Purple Dusk',
    sky: ['#0d0620', '#4b1d7a', '#a63d8f', '#ff7ab8'],
    wash: 'rgba(150, 60, 200, 0.22)',
    glow: '#c86bff',
    band: ['#0d0620', '#4b1d7a'],
    accent: '#ff7ab8',
    subtitle: '#e8c8ff',
  },
};

/** Paints a vertical sky gradient over the whole canvas. */
export function paintSky(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  grade.sky.forEach((colour, i) => sky.addColorStop(i / (grade.sky.length - 1), colour));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
}

/** Washes a photo panel with the grade's warm tint. */
export function washPanel(ctx, rect, grade) {
  ctx.fillStyle = grade.wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const shade = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  shade.addColorStop(0, 'rgba(20, 5, 40, 0)');
  shade.addColorStop(1, 'rgba(20, 5, 40, 0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}
