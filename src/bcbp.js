function stripDiacritics(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function upper(value) {
  return stripDiacritics(value).trim().toUpperCase();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fixed(value, length, { align = "left", pad = " " } = {}) {
  assert(value.length <= length, `字段“${value}”超过 ${length} 个字符。`);
  return align === "right" ? value.padStart(length, pad) : value.padEnd(length, pad);
}

export function formatPassengerName(value) {
  const name = upper(value).replace(/\s+/g, " ");
  assert(name.includes("/"), "乘机人姓名请使用 姓/名 格式，例如 ZHANG/BOKAI。 ");
  assert(/^[A-Z][A-Z '\-]*\/[A-Z][A-Z '\-]*$/.test(name), "乘机人姓名只能包含英文字母、空格、连字符和斜杠。 ");
  return fixed(name, 20);
}

export function formatIataCode(value, label = "机场代码") {
  const code = upper(value);
  assert(/^[A-Z]{3}$/.test(code), `${label}必须是 3 个英文字母。`);
  return code;
}

export function formatCarrier(value) {
  const carrier = upper(value);
  assert(/^[A-Z0-9]{2,3}$/.test(carrier), "承运人代码必须是 2–3 个字母或数字。 ");
  return fixed(carrier, 3);
}

export function formatFlightNumber(value) {
  const flight = String(value ?? "").trim();
  assert(/^\d{1,5}$/.test(flight), "航班号必须是 1–5 位数字。 ");
  return fixed(flight, 5, { align: "right", pad: "0" });
}

export function toJulianDay(value) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value), "航班日期格式无效。 ");
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  assert(
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day,
    "航班日期不存在。",
  );
  const yearStart = Date.UTC(year, 0, 1);
  const julian = Math.floor((date.getTime() - yearStart) / 86_400_000) + 1;
  return String(julian).padStart(3, "0");
}

export function formatSeat(value) {
  const seat = upper(value).replace(/\s/g, "");
  const match = seat.match(/^(\d{1,3})([A-Z])$/);
  assert(match, "座位号格式应类似 32C，且座位排数不超过 3 位。 ");
  return `${match[1].padStart(3, "0")}${match[2]}`;
}

export function formatSequence(value) {
  const sequence = String(value ?? "").trim();
  assert(/^\d{1,5}$/.test(sequence), "登机序号必须是 1–5 位数字。 ");
  return sequence.padStart(5, "0");
}

export function buildBcbp(input) {
  const name = formatPassengerName(input.passengerName);
  const pnr = " ".repeat(7);
  const from = formatIataCode(input.fromCode, "起飞机场代码");
  const to = formatIataCode(input.toCode, "落地机场代码");
  const carrier = formatCarrier(input.carrier);
  const flight = formatFlightNumber(input.flightNumber);
  const julian = toJulianDay(input.flightDate);
  const compartment = upper(input.compartment);
  assert(/^[A-Z]$/.test(compartment), "舱位等级必须是一个英文字母代码。 ");
  const seat = formatSeat(input.seat);
  const sequence = formatSequence(input.sequence);

  // Resolution 792, format M, one-leg mandatory section (exactly 58 characters).
  const payload = [
    "M", // format code
    "1", // number of legs
    name, // passenger name, 20
    "E", // electronic-ticket indicator
    pnr, // operating carrier PNR, 7
    from, // origin, 3
    to, // destination, 3
    carrier, // operating carrier, 3
    flight, // flight number, 5
    julian, // day of year, 3
    compartment, // compartment, 1
    seat, // seat, 4
    sequence, // check-in sequence, 5
    "1", // passenger status: checked in
  ].join("");

  assert(payload.length === 58, `BCBP 核心字段长度异常：应为 58，实际为 ${payload.length}。`);
  assert(/^[\x20-\x7E]+$/.test(payload), "BCBP 只能包含可打印 ASCII 字符。 ");

  return {
    payload,
    normalized: {
      passengerName: name.trimEnd(),
      fromCode: from,
      toCode: to,
      carrier: carrier.trimEnd(),
      flightNumber: String(Number(flight)),
      seat: `${Number(seat.slice(0, 3))}${seat.at(-1)}`,
      sequence: String(Number(sequence)),
      compartment,
      julian,
      pnr: pnr.trimEnd(),
    },
  };
}
