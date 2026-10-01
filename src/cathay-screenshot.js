import { CATHAY_COLORS } from "./cathay-pass.js";

const IOS_FONT = 'system-ui, -apple-system, "Helvetica Neue", sans-serif';

function path(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke();
}

function glassButton(ctx, x, y, width, height) {
  ctx.save();
  ctx.shadowColor = "rgba(63, 63, 76, .12)";
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 12;
  const glass = ctx.createLinearGradient(0, y, 0, y + height);
  glass.addColorStop(0, "#fafafd");
  glass.addColorStop(1, "#f0f0f5");
  ctx.fillStyle = glass;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function statusBar(ctx, time) {
  ctx.fillStyle = "#080808";
  ctx.textBaseline = "top";
  ctx.font = `600 49px ${IOS_FONT}`;
  ctx.fillText(time, 129, 67);

  // Silent bell, cellular bars, 4G, and a low-battery indicator, with separate
  // bounding boxes so no icons collide at different user-entered times.
  ctx.save();
  ctx.translate(278, 73);
  ctx.fillStyle = "#080808";
  ctx.beginPath();
  ctx.moveTo(0, 29);
  ctx.lineTo(6, 23);
  ctx.lineTo(6, 12);
  ctx.bezierCurveTo(6, -5, 30, -5, 30, 12);
  ctx.lineTo(30, 23);
  ctx.lineTo(36, 29);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, 34, 5, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#c1c1c5";
  ctx.lineWidth = 9;
  path(ctx, [[-2, -4], [36, 35]]);
  ctx.strokeStyle = "#080808";
  ctx.lineWidth = 4;
  path(ctx, [[-2, -4], [36, 35]]);
  ctx.restore();

  [15, 23, 32, 41].forEach((height, i) => {
    ctx.fillStyle = i === 3 ? "#929297" : "#080808";
    ctx.beginPath();
    ctx.roundRect(865 + i * 17, 116 - height, 10, height, 4);
    ctx.fill();
  });
  ctx.fillStyle = "#080808";
  ctx.font = `500 44px ${IOS_FONT}`;
  ctx.fillText("4G", 944, 75);
  ctx.fillStyle = "#8e8e93";
  ctx.beginPath();
  ctx.roundRect(1019, 76, 78, 42, 13);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#ff4c59";
  ctx.fillRect(1019, 76, 16, 42);
  ctx.restore();
  ctx.fillStyle = "#8e8e93";
  ctx.beginPath();
  ctx.roundRect(1100, 88, 4, 17, 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 36px ${IOS_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("20", 1061, 76);
  ctx.textAlign = "left";
}

function navigation(ctx) {
  glassButton(ctx, 49, 237, 130, 130);
  glassButton(ctx, 865, 237, 291, 130);
  ctx.strokeStyle = "#151516";
  ctx.fillStyle = "#151516";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  path(ctx, [[123, 276], [97, 302], [123, 328]]);
  ctx.beginPath();
  ctx.roundRect(906, 286, 48, 45, 9);
  ctx.stroke();
  // Erase the top-center seam beneath the upward share arrow.
  ctx.fillStyle = "#f8f8fc";
  ctx.fillRect(921, 280, 17, 14);
  path(ctx, [[930, 315], [930, 264]]);
  path(ctx, [[915, 279], [930, 264], [945, 279]]);
  ctx.fillStyle = "#151516";
  ctx.font = "64px Georgia, serif";
  ctx.textBaseline = "top";
  ctx.fillText("i", 1078, 267);

  glassButton(ctx, 83, 2395, 142, 142);
  glassButton(ctx, 978, 2395, 142, 142);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(133, 2454, 39, 45, 3);
  ctx.stroke();
  path(ctx, [[127, 2447], [178, 2447]]);
  path(ctx, [[143, 2445], [143, 2437], [161, 2437], [161, 2445]]);
  path(ctx, [[145, 2462], [145, 2488]]);
  path(ctx, [[159, 2462], [159, 2488]]);
  ctx.beginPath();
  ctx.moveTo(1009, 2463);
  ctx.bezierCurveTo(1032, 2436, 1069, 2436, 1090, 2463);
  ctx.bezierCurveTo(1069, 2490, 1032, 2490, 1009, 2463);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1049, 2463, 15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#f3f2f7";
  ctx.lineWidth = 13;
  path(ctx, [[1017, 2434], [1080, 2494]]);
  ctx.strokeStyle = "#151516";
  ctx.lineWidth = 5;
  path(ctx, [[1017, 2434], [1080, 2494]]);
}

export function renderCathayScreenshot(canvas, boardingCanvas, screenshotTime) {
  canvas.width = 1206;
  canvas.height = 2622;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#c1c1c5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = CATHAY_COLORS.background;
  ctx.beginPath();
  ctx.roundRect(0, 185, 1206, 3000, 134);
  ctx.fill();
  statusBar(ctx, screenshotTime || "15:37");
  navigation(ctx);
  // Same native size as the preview: keep QR/Aztec modules on whole pixels.
  ctx.drawImage(boardingCanvas, 58, 46, 1090, 1512, 58, 444, 1090, 1512);
}
