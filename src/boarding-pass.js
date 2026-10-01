import { drawPlane, drawBarcode } from "./canvas-parts.js";
import { ensureCathayAssets, renderCathayPass } from "./cathay-pass.js";
import { passStyle } from "./pass-style.js";

const logoUrl = new URL("./assets/umetrip-logo.png", import.meta.url).href;
const PASS_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

const COLORS = {
  black: "#020403",
  green: "#2f8f05",
  greenTop: "#349b08",
  white: "rgba(255,255,255,.96)",
  muted: "rgba(255,255,255,.72)",
};

let logoImage;
let logoPromise;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Logo 图片加载失败。"));
    image.src = src;
  });
}

export async function ensureBoardingPassAssets(style) {
  if (passStyle(style) === "cathay") return ensureCathayAssets();
  if (logoImage) return logoImage;
  if (!logoPromise) {
    logoPromise = loadImage(logoUrl).then((image) => {
      logoImage = image;
      return image;
    });
  }
  return logoPromise;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function label(ctx, text, x, y, align = "left", size = 32) {
  ctx.save();
  ctx.fillStyle = COLORS.muted;
  ctx.font = `300 ${size}px ${PASS_FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function value(ctx, text, x, y, size = 48, align = "left", maxWidth) {
  ctx.save();
  ctx.fillStyle = COLORS.white;
  ctx.font = `300 ${size}px ${PASS_FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  if (maxWidth) ctx.fillText(text, x, y, maxWidth);
  else ctx.fillText(text, x, y);
  ctx.restore();
}

function fitText(ctx, text, x, y, maxWidth, startSize, align = "left") {
  let size = startSize;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = COLORS.white;
  while (size > 24) {
    ctx.font = `300 ${size}px ${PASS_FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function renderBoardingPass(canvas, data, bcbp, barcode = null) {
  if (passStyle(data.passStyle) === "cathay") return renderCathayPass(canvas, data, bcbp, barcode);
  const logo = logoImage;
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(0, 0, W, H);

  const card = { x: 60, y: 48, w: 1086, h: 1508, r: 45 };
  ctx.save();
  ctx.shadowColor = "rgba(45,154,9,.28)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 8;
  const gradient = ctx.createLinearGradient(0, card.y, 0, card.y + 470);
  gradient.addColorStop(0, COLORS.greenTop);
  gradient.addColorStop(1, COLORS.green);
  ctx.fillStyle = gradient;
  roundedRect(ctx, card.x, card.y, card.w, card.h, card.r);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundedRect(ctx, card.x, card.y, card.w, card.h, card.r);
  ctx.clip();

  if (logo) {
    const logoWidth = 282;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(logo, 99, 86, logoWidth, logoHeight);
    ctx.globalAlpha = 1;
  }

  label(ctx, "航班", 944, 82, "right");
  label(ctx, "登机口", 1095, 82, "right");
  value(ctx, `${bcbp.normalized.carrier}${bcbp.normalized.flightNumber}`, 944, 118, 52, "right");
  value(ctx, data.gate || "--", 1095, 118, 52, "right");

  label(ctx, data.fromName, 105, 234);
  label(ctx, data.toName, 1095, 234, "right");
  value(ctx, bcbp.normalized.fromCode, 105, 286, 112);
  value(ctx, bcbp.normalized.toCode, 1095, 286, 112, "right");
  drawPlane(ctx, W / 2, 347);

  ctx.fillStyle = COLORS.black;
  ctx.beginPath();
  ctx.arc(card.x, 376, 15, 0, Math.PI * 2);
  ctx.arc(card.x + card.w, 376, 15, 0, Math.PI * 2);
  ctx.fill();

  const columns = [105, 496, 755, 986];
  label(ctx, "航班日期", columns[0], 446, "left", 29);
  label(ctx, "登机时间", columns[1], 446, "left", 29);
  label(ctx, "座位号", columns[2], 446, "left", 29);
  label(ctx, "舱位等级", columns[3], 446, "left", 29);
  value(ctx, data.flightDate, columns[0], 486, 46);
  value(ctx, data.boardingTime, columns[1], 486, 46);
  value(ctx, bcbp.normalized.seat, columns[2], 486, 46);
  value(ctx, bcbp.normalized.compartment, columns[3], 486, 46);

  const passengerColumns = [105, 487, 835, 986];
  label(ctx, "乘机人", passengerColumns[0], 586, "left", 29);
  label(ctx, "常客卡号", passengerColumns[1], 586, "left", 29);
  label(ctx, "常客等级", passengerColumns[2], 586, "left", 29);
  label(ctx, "登机序号", passengerColumns[3], 586, "left", 29);
  fitText(ctx, bcbp.normalized.passengerName, passengerColumns[0], 626, 350, 43);
  fitText(ctx, data.frequentFlyer || "", passengerColumns[1], 626, 320, 43);
  fitText(ctx, data.frequentFlyerTier || "", passengerColumns[2], 626, 125, 43);
  value(ctx, bcbp.normalized.sequence, passengerColumns[3], 626, 43);

  if (barcode) drawBarcode(ctx, barcode, W / 2, 1102, 430);

  if (logo) {
    ctx.globalAlpha = 0.58;
    ctx.drawImage(logo, 0, 0, logo.height, logo.height, 80, 1473, 66, 66);
  }
  ctx.restore();
}
