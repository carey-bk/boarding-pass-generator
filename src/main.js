import { buildBcbp } from "./bcbp.js";
import { ensureBoardingPassAssets, renderBoardingPass } from "./boarding-pass.js";

export const PASS_DATA_KEY = "iata-boarding-pass-data";

const form = document.querySelector("#pass-form");
const canvas = document.querySelector("#boarding-pass");
const errorBox = document.querySelector("#form-error");
const output = document.querySelector("#bcbp-output");
const generateButton = document.querySelector("#generate-button");

let renderVersion = 0;

function formData() {
  return Object.fromEntries(new FormData(form).entries());
}

function buildAndValidate(data) {
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
    renderBoardingPass(canvas, data, bcbp);
    await ensureBoardingPassAssets();
    if (version !== renderVersion) return;
    renderBoardingPass(canvas, data, bcbp);
    output.textContent = bcbp.payload.replaceAll(" ", "·");
    errorBox.hidden = true;
    generateButton.disabled = false;
  } catch (error) {
    if (version !== renderVersion) return;
    errorBox.textContent = error.message;
    errorBox.hidden = false;
    generateButton.disabled = true;
  }
}

let timer;
form.addEventListener("input", () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(updatePreview, 90);
});

form.addEventListener("reset", () => window.setTimeout(updatePreview));

form.addEventListener("submit", (event) => {
  event.preventDefault();
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
