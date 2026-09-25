import QRCode from "qrcode";

export const QR_VERSION = 7;
export const QR_ERROR_CORRECTION = "M";

export function createBcbpQr(payload) {
  return QRCode.create(payload, {
    version: QR_VERSION,
    errorCorrectionLevel: QR_ERROR_CORRECTION,
  });
}
