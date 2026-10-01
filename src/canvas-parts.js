export function drawPlane(ctx, x, y, color = "rgba(255,255,255,.68)") {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.95, 1.95);
  ctx.fillStyle = color;

  // Traced from the 112 x 80 reference supplied for the demo. The source
  // silhouette is 56 x 50 pixels; keeping those proportions avoids the
  // long, generic aviation glyph used by the previous implementation.
  ctx.beginPath();
  ctx.moveTo(-27.5, -11.5);
  ctx.lineTo(-27.5, 12.5);
  ctx.lineTo(-24.5, 12.5);
  ctx.lineTo(-18.5, 3.5);
  ctx.lineTo(-6.5, 5.5);
  ctx.lineTo(-15.5, 24.5);
  ctx.lineTo(-10.5, 24.5);
  ctx.lineTo(8.5, 4.5);
  ctx.lineTo(23.5, 4.5);
  ctx.quadraticCurveTo(27.5, 4, 27.5, 0.5);
  ctx.quadraticCurveTo(25.5, -3.5, 21.5, -4.5);
  ctx.lineTo(7.5, -4.5);
  ctx.lineTo(-11.5, -24.5);
  ctx.lineTo(-15.5, -23.5);
  ctx.lineTo(-8.5, -9.5);
  ctx.lineTo(-8.5, -4.5);
  ctx.lineTo(-19.5, -3.5);
  ctx.lineTo(-22.5, -9.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawBarcode(ctx, { modules, quietModules }, centerX, top, maxSize) {
  const modulesAcross = modules.size + quietModules * 2;
  const modulePixels = Math.max(1, Math.floor(maxSize / modulesAcross));
  const actualSize = modulesAcross * modulePixels;
  const x = Math.round(centerX - actualSize / 2);

  ctx.save();
  ctx.fillStyle = "#ffffff";
  // Keep whole-pixel modules and the margin appropriate to the selected format.
  ctx.beginPath();
  ctx.roundRect(x, top, actualSize, actualSize, 12);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (!modules.get(row, col)) continue;
      ctx.fillRect(
        x + (col + quietModules) * modulePixels,
        top + (row + quietModules) * modulePixels,
        modulePixels,
        modulePixels,
      );
    }
  }
  ctx.restore();
}
