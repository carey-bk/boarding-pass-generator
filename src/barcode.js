import { createBcbpQr } from "./qr.js";

export function barcodeFormat(value = "qr") {
  if (value === "qr" || value === "aztec") return value;
  throw new Error("请选择 QR 二维码或 Aztec 码。");
}

export function barcodeLabel(format) {
  return barcodeFormat(format) === "aztec" ? "AZTEC" : "QR VERSION 7";
}

export async function createBcbpBarcode(payload, format = "qr") {
  if (barcodeFormat(format) === "qr") {
    const { modules } = createBcbpQr(payload);
    return { modules, quietModules: 4 };
  }

  // Load the Aztec encoder only when selected; the QR page stays lightweight.
  const { createBcbpAztec } = await import("./aztec.js");
  return createBcbpAztec(payload);
}
