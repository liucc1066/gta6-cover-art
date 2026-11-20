// Procedural palm-tree silhouettes, drawn from scratch on canvas: a curved
// trunk, a crown of tapered fronds and a pair of coconuts. No borrowed art.

/** Draws one palm silhouette with its base at (x, y), `size` tall. */
export function drawPalm(ctx, x, y, size, lean, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  const trunkTopX = size * 0.10;
  const trunkTopY = -size * 0.78;
  // Trunk: a filled, gently curving shape, wide at the base, narrow at top.
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, 0);
  ctx.quadraticCurveTo(-size * 0.02, -size * 0.4, trunkTopX - size * 0.018, trunkTopY);
  ctx.lineTo(trunkTopX + size * 0.018, trunkTopY);
  ctx.quadraticCurveTo(size * 0.05, -size * 0.4, size * 0.045, 0);
  ctx.closePath();
  ctx.fill();
  // Crown: seven fronds fanning out from the trunk top.
  const crownX = trunkTopX;
  const crownY = trunkTopY;
  const frondCount = 7;
  for (let i = 0; i < frondCount; i++) {
    const angle = Math.PI * (0.08 + (i / (frondCount - 1)) * 0.84);
    const length = size * (0.30 + 0.10 * Math.sin((i / (frondCount - 1)) * Math.PI));
    const tipX = crownX + Math.cos(angle) * length;
    const tipY = crownY - Math.sin(angle) * length * 0.55 + length * 0.28;
    const midX = crownX + Math.cos(angle) * length * 0.55;
    const midY = crownY - Math.sin(angle) * length * 0.62;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.quadraticCurveTo(midX + size * 0.02, midY + size * 0.05, crownX + size * 0.015, crownY + size * 0.02);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts under the crown.
  ctx.beginPath();
  ctx.arc(crownX - size * 0.02, crownY + size * 0.03, size * 0.022, 0, Math.PI * 2);
  ctx.arc(crownX + size * 0.025, crownY + size * 0.035, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draws a small cluster of palms along the bottom edge of a rectangle. */
export function drawPalmCluster(ctx, rect, colour) {
  const base = rect.y + rect.h;
  drawPalm(ctx, rect.x + rect.w * 0.06, base, rect.h * 1.25, -0.10, colour);
  drawPalm(ctx, rect.x + rect.w * 0.16, base, rect.h * 0.9, 0.08, colour);
  drawPalm(ctx, rect.x + rect.w * 0.94, base, rect.h * 1.15, 0.10, colour);
}
