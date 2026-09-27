import test from "node:test";
import assert from "node:assert/strict";
import ZXing from "@zxing/library";
import { buildBcbp } from "../src/bcbp.js";
import { createBcbpBarcode } from "../src/barcode.js";

// ZXing ships CommonJS: destructure its default export for Node 20/22 as well.
const {
  AztecCodeReader,
  QRCodeReader,
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
} = ZXing;

const sample = {
  passengerName: "Peter/Parker", fromCode: "NKG", toCode: "SYD",
  carrier: "MU", flightNumber: "777", flightDate: "2026-01-01",
  compartment: "Y", seat: "31A", sequence: "123",
};

function decode(symbol, format) {
  const { modules, quietModules } = symbol;
  const scale = 8;
  const width = (modules.size + quietModules * 2) * scale;
  const pixels = new Uint8ClampedArray(width * width).fill(255);
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (!modules.get(row, col)) continue;
      const x = (col + quietModules) * scale;
      const y = (row + quietModules) * scale;
      for (let dy = 0; dy < scale; dy++) pixels.fill(0, (y + dy) * width + x, (y + dy) * width + x + scale);
    }
  }
  const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(pixels, width, width)));
  return (format === "aztec" ? new AztecCodeReader() : new QRCodeReader()).decode(bitmap).getText();
}

for (const [name, data] of [
  ["default passenger", sample],
  ["original sample", { ...sample, passengerName: "ZHANG/BOKAI", toCode: "LJG", carrier: "HO", flightNumber: "2275", flightDate: "2025-10-04", seat: "32C", sequence: "140" }],
  ["punctuation and full-width fields", { ...sample, passengerName: "O'NEILL/JEAN-PAUL", carrier: "ABC", flightNumber: "99999", seat: "999Z", sequence: "99999", flightDate: "2024-12-31" }],
]) {
  test(`QR and Aztec independently decode to identical BCBP bytes: ${name}`, async () => {
    const { payload } = buildBcbp(data);
    for (const format of ["qr", "aztec"]) {
      const symbol = await createBcbpBarcode(payload, format);
      const decoded = decode(symbol, format);
      assert.equal(decoded, payload);
      assert.equal(decoded.length, 58);
      assert.equal(decoded.slice(23, 30), " ".repeat(7));
    }
  });
}

test("missing barcode choice keeps existing QR behavior; invalid choices fail", async () => {
  const { payload } = buildBcbp(sample);
  assert.equal((await createBcbpBarcode(payload)).modules.size, 45);
  await assert.rejects(createBcbpBarcode(payload, "unsupported"), /QR/);
});
