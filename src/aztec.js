import bwipjs from "@bwip-js/generic";

export function createBcbpAztec(payload) {
  // Pass the exact BCBP string through, including all fixed-width ASCII spaces.
  const [symbol] = bwipjs.raw({
    bcid: "azteccode",
    text: payload,
    binarytext: true,
    eclevel: 23,
    ecaddchars: 3,
  });
  if (!symbol || symbol.pixx !== symbol.pixy) {
    throw new Error("Aztec 条码生成失败，请重试。");
  }
  return {
    modules: {
      size: symbol.pixx,
      // BWIPP's raw pixels run bottom-to-top; canvas rows run top-to-bottom.
      get: (row, col) => symbol.pixs[(symbol.pixy - 1 - row) * symbol.pixx + col],
    },
    // Aztec has no mandatory quiet zone; keep a small visual margin on the card.
    quietModules: 2,
  };
}
