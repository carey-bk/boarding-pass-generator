import { buildBcbp } from "./bcbp.js";
import { barcodeFormat, barcodeLabel, createBcbpBarcode } from "./barcode.js";
import { ensureBoardingPassAssets, renderBoardingPass } from "./boarding-pass.js";
import { passStyle, passStyleLabel, CATHAY_EXAMPLE } from "./pass-style.js";

export const PASS_DATA_KEY = "iata-boarding-pass-data";

const form = document.querySelector("#pass-form");
const canvas = document.querySelector("#boarding-pass");
const errorBox = document.querySelector("#form-error");
const output = document.querySelector("#bcbp-output");
const generateButton = document.querySelector("#generate-button");
const barcodeStatus = document.querySelector("#preview-barcode-status");
const params = new URL(window.location.href).searchParams;
const requestedFormat = params.get("barcode");
const requestedStyle = params.get("style");
function fillFields(data) {
  for (const [name, value] of Object.entries(data)) {
    const field = form.elements.namedItem(name);
    if (field && "value" in field) field.value = value;
  }
}
if (requestedStyle === "cathay") fillFields(CATHAY_EXAMPLE);
if (requestedFormat === "aztec" || requestedFormat === "qr") {
  const option = form.elements.barcodeFormat.querySelector(`[value="${requestedFormat}"]`);
  option.defaultSelected = true;
  form.elements.barcodeFormat.value = requestedFormat;
}
// Only the explicit return-to-editor link restores a prior result. A normal
// visit or shared style link always starts with its own example.
if (params.get("edit") === "1") {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PASS_DATA_KEY));
    if (saved && typeof saved === "object") fillFields(saved);
  } catch { /* A missing or malformed session falls back to the example. */ }
}

let renderVersion = 0;

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function buildAndValidate(data) {
  passStyle(data.passStyle);
  barcodeFormat(data.barcodeFormat);
  const bcbp = buildBcbp(data);
  if (!/^\d{2}:\d{2}$/.test(data.screenshotTime || "")) {
    throw new Error("请选择截图时间。");
  }
  return bcbp;
}

async function updatePreview() {
  const version = ++renderVersion;
  try {
    const data = formData();
    const isCathay = data.passStyle === "cathay";
    document.querySelector("#cathay-options").hidden = !isCathay;
    document.querySelector("#terminal-field").hidden = !isCathay;
    document.querySelector("#preview-style-label").textContent = `实时预览 · ${passStyleLabel(data.passStyle)}`;
    document.querySelector("#screenshot-style-hint").textContent = isCathay
      ? "导出浅色 Wallet 截图；截图时间可修改，其余状态栏图标保持参考图样式。"
      : "导出深色 iPhone 截图；截图时间可修改，其余状态栏图标保持固定样式。";
    const bcbp = buildAndValidate(data);
    generateButton.disabled = true;
    barcodeStatus.textContent = `正在生成 ${barcodeLabel(data.barcodeFormat)}…`;
    output.textContent = bcbp.payload.replaceAll(" ", "·");
    renderBoardingPass(canvas, data, bcbp);
    const barcode = await createBcbpBarcode(bcbp.payload, data.barcodeFormat);
    if (version !== renderVersion) return;
    renderBoardingPass(canvas, data, bcbp, barcode);
    await ensureBoardingPassAssets(data.passStyle);
    if (version !== renderVersion) return;
    renderBoardingPass(canvas, data, bcbp, barcode);
    barcodeStatus.textContent = `IATA BCBP · ${barcodeLabel(data.barcodeFormat)}`;
    errorBox.hidden = true;
    generateButton.disabled = false;
  } catch (error) {
    if (version !== renderVersion) return;
    errorBox.textContent = error.message;
    errorBox.hidden = false;
    generateButton.disabled = true;
    barcodeStatus.textContent = "请检查填写内容";
  }
}

let timer;
form.addEventListener("input", () => {
  // Invalidate in-flight work immediately, including while the debounce runs.
  ++renderVersion;
  generateButton.disabled = true;
  window.clearTimeout(timer);
  timer = window.setTimeout(updatePreview, 90);
});

form.addEventListener("reset", () => {
  const currentStyle = form.elements.passStyle.value;
  const currentFormat = form.elements.barcodeFormat.value;
  ++renderVersion;
  generateButton.disabled = true;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    if (currentStyle === "cathay") fillFields(CATHAY_EXAMPLE);
    form.elements.barcodeFormat.value = currentFormat;
    updatePreview();
  });
});

document.querySelector("#cathay-example").addEventListener("click", () => {
  window.clearTimeout(timer);
  fillFields(CATHAY_EXAMPLE);
  updatePreview();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (generateButton.disabled) return;
  try {
    const data = formData();
    buildAndValidate(data);
    sessionStorage.setItem(PASS_DATA_KEY, JSON.stringify(data));
    window.location.assign(new URL("./result.html", window.location.href));
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  }
});

updatePreview();
