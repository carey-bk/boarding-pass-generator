import { buildBcbp } from "./bcbp.js";
import { barcodeFormat, barcodeLabel, createBcbpBarcode } from "./barcode.js";
import { ensureBoardingPassAssets, renderBoardingPass } from "./boarding-pass.js";
import { renderIphoneScreenshot } from "./iphone-screenshot.js";

const PASS_DATA_KEY = "iata-boarding-pass-data";
const canvas = document.querySelector("#result-canvas");
const content = document.querySelector("#result-content");
const errorBox = document.querySelector("#result-error");
const downloadButton = document.querySelector("#result-download");
const screenshotButton = document.querySelector("#screenshot-download");
const screenshotCanvas = document.querySelector("#screenshot-canvas");

function showError(message) {
  content.hidden = true;
  downloadButton.disabled = true;
  screenshotButton.disabled = true;
  errorBox.querySelector("p").textContent = message;
  errorBox.hidden = false;
}

function downloadCanvas(targetCanvas, filename, button, idleLabel) {
  button.disabled = true;
  button.textContent = "正在生成…";
  targetCanvas.toBlob((blob) => {
    if (!blob) {
      button.disabled = false;
      button.textContent = "下载失败，请重试";
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    button.textContent = "下载已开始";
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      button.disabled = false;
      button.textContent = idleLabel;
    }, 1_500);
  }, "image/png");
}

async function initialize() {
  try {
    const stored = sessionStorage.getItem(PASS_DATA_KEY);
    if (!stored) throw new Error("请先返回填写航班信息，再点击“生成 PNG”。");
    const data = JSON.parse(stored);
    const format = barcodeFormat(data.barcodeFormat);
    const bcbp = buildBcbp(data);
    renderBoardingPass(canvas, data, bcbp);
    const barcode = await createBcbpBarcode(bcbp.payload, format);
    renderBoardingPass(canvas, data, bcbp, barcode);
    await ensureBoardingPassAssets();
    renderBoardingPass(canvas, data, bcbp, barcode);
    await renderIphoneScreenshot(screenshotCanvas, canvas, data.screenshotTime || "14:37");

    document.querySelector("#result-route").textContent = `${bcbp.normalized.fromCode} → ${bcbp.normalized.toCode}`;
    document.querySelector("#result-passenger").textContent = bcbp.normalized.passengerName;
    document.querySelector("#result-flight").textContent = `${bcbp.normalized.carrier}${bcbp.normalized.flightNumber}`;
    document.querySelector("#result-date").textContent = data.flightDate;
    document.querySelector("#result-time").textContent = data.screenshotTime || "14:37";
    document.querySelector("#result-bcbp").textContent = bcbp.payload.replaceAll(" ", "·");
    document.querySelector("#result-barcode-status").textContent = `IATA BCBP · ${barcodeLabel(format)}`;
    document.querySelector("#result-barcode-description").textContent = format === "aztec"
      ? "Aztec 码与 QR 版本使用完全相同的 BCBP 明文，包括定长字段中的 ASCII 空格。"
      : "QR 二维码使用 Version 7；切换 Aztec 仅改变条码格式，不改变 BCBP 明文。";
    document.querySelector("#result-back").href = `./index.html?barcode=${format}`;
    const suffix = format === "aztec" ? "-aztec" : "";
    downloadButton.addEventListener("click", () => {
      const filename = `boarding-pass-${data.fromCode}-${data.toCode}${suffix}.png`.toLowerCase();
      downloadCanvas(canvas, filename, downloadButton, "下载 PNG");
    });
    screenshotButton.addEventListener("click", () => {
      const filename = `iphone-boarding-pass-${data.fromCode}-${data.toCode}${suffix}.png`.toLowerCase();
      downloadCanvas(screenshotCanvas, filename, screenshotButton, "下载截图");
    });
    downloadButton.disabled = false;
    screenshotButton.disabled = false;
  } catch (error) {
    showError(error.message);
  }
}

initialize();
