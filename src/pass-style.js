export function passStyle(value = "umetrip") {
  if (value !== "umetrip" && value !== "cathay") throw new Error("请选择航旅纵横或国泰航空样式。");
  return value;
}

export function passStyleLabel(value) {
  return passStyle(value) === "cathay" ? "国泰航空" : "航旅纵横";
}

export function shortFlightDate(date) {
  const [, month, day] = date.split("-").map(Number);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${String(day).padStart(2, "0")} ${months[month - 1]}`;
}

// Display groups match the existing form. This does not rewrite the barcode's
// compartment character or claim universal airline booking-class mappings.
export function cabinLabel(code) {
  if ("FAP".includes(code)) return "First";
  if ("JCDIZ".includes(code)) return "Business";
  if ("WSR".includes(code)) return "Premium Economy";
  return "Economy";
}

// Fictional passenger: never copy personal data from a reference boarding pass.
export const CATHAY_EXAMPLE = Object.freeze({
  passStyle: "cathay", fromName: "HONG KONG", fromCode: "HKG",
  toName: "NEW YORK", toCode: "JFK", carrier: "CX", flightNumber: "844",
  flightDate: "2026-10-01", boardingTime: "01:30", terminal: "1", gate: "36",
  compartment: "Y", passengerName: "Peter/Parker", seat: "72A",
  sequence: "123", frequentFlyer: "", frequentFlyerTier: "", screenshotTime: "15:37",
});
