import test from "node:test";
import assert from "node:assert/strict";
import { passStyle, passStyleLabel, shortFlightDate, cabinLabel, CATHAY_EXAMPLE } from "../src/pass-style.js";
import { buildBcbp } from "../src/bcbp.js";
import { renderBoardingPass } from "../src/boarding-pass.js";
import { renderIphoneScreenshot } from "../src/iphone-screenshot.js";

function recordingCanvas() {
  const calls = [];
  const context = new Proxy({
    measureText: (text) => ({ width: text.length * 20 }),
    createLinearGradient: () => ({ addColorStop() {} }),
  }, {
    get(target, key) {
      return key in target ? target[key] : (...args) => calls.push([key, ...args]);
    },
  });
  return { width: 1206, height: 1609, getContext: () => context, calls };
}

test("old saved data defaults to Umetrip; unknown styles are rejected", () => {
  assert.equal(passStyle(), "umetrip");
  assert.equal(passStyleLabel("cathay"), "国泰航空");
  assert.throws(() => passStyle("other"), /样式/);
});

test("Cathay date display is deterministic, with existing cabin groups", () => {
  assert.equal(shortFlightDate("2026-10-01"), "01 OCT");
  assert.equal(shortFlightDate("2026-01-21"), "21 JAN");
  assert.equal(shortFlightDate("2024-12-01"), "01 DEC");
  assert.equal(cabinLabel("J"), "Business");
  assert.equal(cabinLabel("F"), "First");
  assert.equal(cabinLabel("W"), "Premium Economy");
  assert.equal(cabinLabel("Y"), "Economy");
});

test("style, terminal, gate and optional display data never change the payload", () => {
  const before = buildBcbp(CATHAY_EXAMPLE).payload;
  const after = buildBcbp({ ...CATHAY_EXAMPLE, passStyle: "umetrip", terminal: "2", gate: "99", frequentFlyer: "TEST1234" }).payload;
  assert.equal(before, after);
});

test("Cathay layout renders the reference fields, with blank optional membership hidden", () => {
  const canvas = recordingCanvas();
  renderBoardingPass(canvas, CATHAY_EXAMPLE, buildBcbp(CATHAY_EXAMPLE));
  const strings = canvas.calls.filter(([method]) => method === "fillText").map(([, value]) => value);
  for (const value of ["01 OCT", "SEAT", "72A", "CX844", "HONG KONG", "NEW YORK", "HKG", "JFK", "BOARDING TIME", "01:30", "TERMINAL", "1", "GATE", "36", "PASSENGER NAME", "PETER/PARKER", "Economy"]) {
    assert.ok(strings.includes(value), value);
  }
  assert.ok(!strings.includes("FREQUENT FLYER"));
  assert.ok(!strings.includes("123"));
});

test("Cathay membership remains available when entered", () => {
  const canvas = recordingCanvas();
  const data = { ...CATHAY_EXAMPLE, frequentFlyer: "TEST123456", frequentFlyerTier: "Gold" };
  renderBoardingPass(canvas, data, buildBcbp(data));
  assert.ok(canvas.calls.some(([method, value]) => method === "fillText" && value === "TEST123456  /  Gold"));
});

test("Umetrip keeps its original labels and native-size card geometry", () => {
  const canvas = recordingCanvas();
  const data = { ...CATHAY_EXAMPLE, passStyle: "umetrip" };
  renderBoardingPass(canvas, data, buildBcbp(data));
  assert.ok(canvas.calls.some(([method, value]) => method === "fillText" && value === "航班日期"));
  assert.ok(canvas.calls.some(([method, value]) => method === "fillText" && value === "登机序号"));
  assert.ok(canvas.calls.some((call) => JSON.stringify(call) === JSON.stringify(["roundRect", 60, 48, 1086, 1508, 45])));
});

test("Cathay screenshot uses reference dimensions, user time, and unscaled pass pixels", async () => {
  const canvas = recordingCanvas();
  const pass = recordingCanvas();
  await renderIphoneScreenshot(canvas, pass, "09:00", "cathay");
  assert.deepEqual([canvas.width, canvas.height], [1206, 2622]);
  assert.ok(canvas.calls.some(([method, text]) => method === "fillText" && text === "09:00"));
  const draw = canvas.calls.find(([method]) => method === "drawImage");
  assert.equal(draw[1], pass);
  assert.deepEqual(draw.slice(4, 6), draw.slice(8, 10));
});
