import { buildBcbp } from "./bcbp.js";
import { barcodeFormat, barcodeLabel, createBcbpBarcode } from "./barcode.js";
import { ensureBoardingPassAssets, renderBoardingPass } from "./boarding-pass.js";

export const PASS_DATA_KEY = "iata-boarding-pass-data";

const form = document.querySelector("#pass-form");
const canvas = document.querySelector("#boarding-pass");
const errorBox = document.querySelector("#form-error");
const output = document.querySelector("#bcbp-output");
const generateButton = document.querySelector("#generate-button");
const barcodeStatus = document.querySelector("#preview-barcode-status");
const requestedFormat = new URL(window.location.href).searchParams.get("barcode");
if (requestedFormat === "aztec" || requestedFormat === "qr") {
  const option = form.elements.barcodeFormat.querySelector(`[value="${requestedFormat}"]`);
  option.defaultSelected = true;
  form.elements.barcodeFormat.value = requestedFormat;
}

let renderVersion = 0;

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function buildAndValidate(data) {
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
    const bcbp = buildAndValidate(data);
    generateButton.disabled = true;
    barcodeStatus.textContent = `正在生成 ${barcodeLabel(data.barcodeFormat)}…`;
    output.textContent = bcbp.payload.replaceAll(" ", "·");
    renderBoardingPass(canvas, data, bcbp);
    const barcode = await createBcbpBarcode(bcbp.payload, data.barcodeFormat);
    if (version !== renderVersion) return;
    renderBoardingPass(canvas, data, bcbp, barcode);
    await ensureBoardingPassAssets();
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
  ++renderVersion;
  generateButton.disabled = true;
  window.clearTimeout(timer);
  timer = window.setTimeout(updatePreview);
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
