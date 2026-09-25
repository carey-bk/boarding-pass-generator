import { buildBcbp } from "./bcbp.js";
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
    const bcbp = buildBcbp(data);
    renderBoardingPass(canvas, data, bcbp);
    await ensureBoardingPassAssets();
    renderBoardingPass(canvas, data, bcbp);
    await renderIphoneScreenshot(screenshotCanvas, canvas, data.screenshotTime || "14:37");

    document.querySelector("#result-route").textContent = `${bcbp.normalized.fromCode} → ${bcbp.normalized.toCode}`;
    document.querySelector("#result-passenger").textContent = bcbp.normalized.passengerName;
    document.querySelector("#result-flight").textContent = `${bcbp.normalized.carrier}${bcbp.normalized.flightNumber}`;
    document.querySelector("#result-date").textContent = data.flightDate;
    document.querySelector("#result-time").textContent = data.screenshotTime || "14:37";
    document.querySelector("#result-bcbp").textContent = bcbp.payload.replaceAll(" ", "·");
    downloadButton.addEventListener("click", () => {
      const filename = `boarding-pass-${data.fromCode}-${data.toCode}.png`.toLowerCase();
      downloadCanvas(canvas, filename, downloadButton, "下载 PNG");
    });
    screenshotButton.addEventListener("click", () => {
      const filename = `iphone-boarding-pass-${data.fromCode}-${data.toCode}.png`.toLowerCase();
      downloadCanvas(screenshotCanvas, filename, screenshotButton, "下载截图");
    });
  } catch (error) {
    showError(error.message);
  }
}

initialize();
