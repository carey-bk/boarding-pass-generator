import { DEMO_CORNER_DATA_URL } from "./demo-corner.js";

const SCREEN = { width: 1280, height: 2781 };
const CARD_SOURCE = { x: 60, y: 48, width: 1086, height: 1508 };
const CARD_TARGET = { x: 58, y: 372, width: 1164, height: 1638, radius: 47 };
const IOS_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
let demoCornerPromise;

function loadDemoCorner() {
  if (!demoCornerPromise) {
    demoCornerPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Demo 状态栏素材加载失败。"));
      image.src = DEMO_CORNER_DATA_URL;
    });
  }
  return demoCornerPromise;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawLocationArrow(ctx) {
  ctx.save();
  ctx.fillStyle = "#f8f8f8";
  // Pixel-traced from the iOS location-services glyph in the dark reference.
  ctx.beginPath();
  ctx.moveTo(333, 76);
  ctx.lineTo(328, 76);
  ctx.lineTo(296, 91);
  ctx.quadraticCurveTo(294, 94, 297, 96);
  ctx.lineTo(312, 96);
  ctx.lineTo(313, 112);
  ctx.quadraticCurveTo(316, 116, 319, 112);
  ctx.lineTo(334, 79);
  ctx.quadraticCurveTo(335, 76, 333, 76);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCloseButton(ctx) {
  ctx.save();
  ctx.fillStyle = "#181818";
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(122.5, 244.5, 64.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "#f5f5f5";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(95, 217);
  ctx.lineTo(150, 272);
  ctx.moveTo(150, 217);
  ctx.lineTo(95, 272);
  ctx.stroke();
  ctx.restore();
}

function drawCard(ctx, boardingCanvas) {
  ctx.save();
  ctx.shadowColor = "rgba(67,172,34,.26)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#2f8f05";
  roundedRect(
    ctx,
    CARD_TARGET.x,
    CARD_TARGET.y,
    CARD_TARGET.width,
    CARD_TARGET.height,
    CARD_TARGET.radius,
  );
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(
    ctx,
    CARD_TARGET.x,
    CARD_TARGET.y,
    CARD_TARGET.width,
    CARD_TARGET.height,
    CARD_TARGET.radius,
  );
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    boardingCanvas,
    CARD_SOURCE.x,
    CARD_SOURCE.y,
    CARD_SOURCE.width,
    CARD_SOURCE.height,
    CARD_TARGET.x,
    CARD_TARGET.y,
    CARD_TARGET.width,
    CARD_TARGET.height,
  );
  ctx.restore();
}

export async function renderIphoneScreenshot(canvas, boardingCanvas, screenshotTime = "15:00") {
  const demoCorner = await loadDemoCorner();
  canvas.width = SCREEN.width;
  canvas.height = SCREEN.height;
  const ctx = canvas.getContext("2d", { alpha: false });

  ctx.fillStyle = "#010101";
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
  ctx.drawImage(demoCorner, 880, 50);

  ctx.fillStyle = "#f8f8f8";
  ctx.font = `600 53px ${IOS_FONT}`;
  ctx.fontKerning = "normal";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(screenshotTime || "15:00", 126, 64);

  drawLocationArrow(ctx);
  drawCloseButton(ctx);
  drawCard(ctx, boardingCanvas);
}
