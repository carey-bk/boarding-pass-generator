import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBcbp,
  formatCarrier,
  formatFlightNumber,
  formatPassengerName,
  formatSeat,
  formatSequence,
  toJulianDay,
} from "../src/bcbp.js";
import { createBcbpQr, QR_VERSION } from "../src/qr.js";

const sample = {
  passengerName: "ZHANG/BOKAI",
  fromCode: "NKG",
  toCode: "LJG",
  carrier: "HO",
  flightNumber: "2275",
  flightDate: "2025-10-04",
  compartment: "Y",
  seat: "32C",
  sequence: "140",
};

test("builds an exact 58-character Resolution 792 mandatory section", () => {
  const result = buildBcbp(sample);
  assert.equal(result.payload.length, 58);
  assert.equal(result.payload, "M1ZHANG/BOKAI         E       NKGLJGHO 02275277Y032C001401");
});

test("normalizes fixed-width numeric and alpha fields", () => {
  assert.equal(formatCarrier("ho"), "HO ");
  assert.equal(formatFlightNumber("2275"), "02275");
  assert.equal(formatSeat("32c"), "032C");
  assert.equal(formatSequence("140"), "00140");
  assert.equal(formatPassengerName("zhang/bokai").length, 20);
});

test("accepts common one-letter booking class codes", () => {
  assert.equal(buildBcbp({ ...sample, compartment: "C" }).normalized.compartment, "C");
  assert.equal(buildBcbp({ ...sample, compartment: "K" }).normalized.compartment, "K");
});

test("calculates day-of-year in UTC and supports leap years", () => {
  assert.equal(toJulianDay("2025-10-04"), "277");
  assert.equal(toJulianDay("2024-12-31"), "366");
});

test("rejects invalid values instead of silently truncating", () => {
  assert.throws(() => buildBcbp({ ...sample, fromCode: "NANJING" }), /3 个英文字母/);
  assert.throws(() => buildBcbp({ ...sample, seat: "1234C" }), /座位号格式/);
  assert.throws(() => buildBcbp({ ...sample, sequence: "ABC" }), /登机序号/);
});

test("uses a Version 7 QR symbol to match the demo alignment pattern", () => {
  const { payload } = buildBcbp(sample);
  const qr = createBcbpQr(payload);
  assert.equal(QR_VERSION, 7);
  assert.equal(qr.modules.size, 45);
});
