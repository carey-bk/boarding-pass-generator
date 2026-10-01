import { drawPlane, drawBarcode } from "./canvas-parts.js";
import { cabinLabel, shortFlightDate } from "./pass-style.js";

const FONT = 'system-ui, -apple-system, "Helvetica Neue", "PingFang SC", sans-serif';
export const CATHAY_COLORS = Object.freeze({
  paper: "#fcfcfc", teal: "#006268", ink: "#080b0c",
  background: "#f2f1f7", border: "#dfdfe2",
});
const wingUrl = new URL("./assets/cathay-brushwing.svg", import.meta.url).href;
const allianceUrl = new URL("./assets/oneworld.svg", import.meta.url).href;
let assets;
let loading;

export function ensureCathayAssets() {
  if (assets) return Promise.resolve(assets);
  if (!loading) {
    loading = Promise.all([wingUrl, allianceUrl].map((src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("国泰标志加载失败，请重试。"));
      image.src = src;
    }))).then(([wing, alliance]) => (assets = { wing, alliance })).catch((error) => {
      loading = undefined;
      throw error;
    });
  }
  return loading;
}

function text(ctx, content, x, y, size, { color = CATHAY_COLORS.ink, weight = 300, align = "left", maxWidth = 1000 } = {}) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  do {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(content).width <= maxWidth || size <= 20) break;
    size -= 1;
  } while (true);
  ctx.fillText(content, x, y);
  ctx.restore();
}

function label(ctx, content, x, y, align = "left", maxWidth = 1000) {
  text(ctx, content, x, y, 32, { color: CATHAY_COLORS.teal, weight: 500, align, maxWidth });
}

export function renderCathayPass(canvas, data, bcbp, barcode) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const { paper, teal, background, border } = CATHAY_COLORS;
  const normalized = bcbp.normalized;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(60, 48, 1086, 1508, 40);
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.clip();

  if (assets) {
    ctx.drawImage(assets.wing, 105, 104, 47, 57);
    ctx.drawImage(assets.alliance, 514, 117, 52, 52);
  }
  ctx.fillStyle = teal;
  ctx.font = '400 36px Georgia, "Times New Roman", serif';
  ctx.textBaseline = "top";
  ctx.fillText("CATHAY PACIFIC", 164, 127, 326);

  label(ctx, shortFlightDate(data.flightDate), 900, 81, "right");
  label(ctx, "SEAT", 1102, 81, "right");
  text(ctx, `${normalized.carrier}${normalized.flightNumber}`, 900, 116, 62, { align: "right", maxWidth: 295 });
  text(ctx, normalized.seat, 1102, 116, 62, { align: "right", maxWidth: 165 });

  label(ctx, (data.fromName || "").toUpperCase(), 105, 255, "left", 420);
  label(ctx, (data.toName || "").toUpperCase(), 1102, 255, "right", 420);
  text(ctx, normalized.fromCode, 105, 299, 116);
  text(ctx, normalized.toCode, 1102, 299, 116, { align: "right" });
  drawPlane(ctx, 605, 361, teal);

  const notchY = 427;
  ctx.fillStyle = background;
  ctx.strokeStyle = border;
  for (const x of [60, 1146]) {
    ctx.beginPath();
    ctx.arc(x, notchY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  label(ctx, "BOARDING TIME", 105, 464);
  label(ctx, "TERMINAL", 694, 464, "center");
  label(ctx, "GATE", 1102, 464, "right");
  text(ctx, data.boardingTime, 105, 504, 51);
  text(ctx, data.terminal || "-", 694, 504, 51, { align: "center", maxWidth: 240 });
  text(ctx, data.gate || "-", 1102, 504, 51, { align: "right", maxWidth: 240 });

  label(ctx, "PASSENGER NAME", 105, 628);
  text(ctx, normalized.passengerName, 105, 671, 51, { maxWidth: 990 });

  // Keep optional user-entered membership information, without empty labels.
  if (data.frequentFlyer || data.frequentFlyerTier) {
    label(ctx, "FREQUENT FLYER", 105, 773);
    text(ctx, [data.frequentFlyer, data.frequentFlyerTier].filter(Boolean).join("  /  "), 105, 814, 38, { maxWidth: 990 });
  }

  ctx.fillStyle = teal;
  ctx.fillRect(385, 958, 436, 45);
  text(ctx, cabinLabel(normalized.compartment), 603, 962, 34, { color: paper, align: "center", maxWidth: 414 });
  if (barcode) drawBarcode(ctx, barcode, 603, 1005, 477);

  // A small brushwing app tile echoes the Wallet reference without a dated
  // anniversary badge. The original screenshot is never bundled in the app.
  ctx.fillStyle = paper;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(82, 1478, 60, 60, 14);
  ctx.fill();
  ctx.stroke();
  if (assets) ctx.drawImage(assets.wing, 98, 1487, 32, 39);
  ctx.restore();
}
