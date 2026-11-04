// Procedural silk-fold wallpaper: layered wavy sheets with lit edges and soft shadows.
import sharp from "sharp";

const [, , out = "wallpaper.png", W_ = "1800", H_ = "3400", seed_ = "7"] = process.argv;
const W = +W_, H = +H_;
let s = +seed_;
const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const srgb2lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lin2srgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const lin = (h) => hex(h).map(srgb2lin);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Back to front: each sheet goes from a body colour to a brighter lit-edge colour.
const SHEETS = [
  ["#0b1a5e", "#2348d8"],
  ["#0e2284", "#2f6bff"],
  ["#151f9c", "#5a6dff"],
  ["#2a1aa8", "#8a52ff"],
  ["#4a169c", "#c24df0"],
  ["#74127f", "#f0509e"],
  ["#8f1450", "#ff6a6a"],
  ["#a01f2c", "#ff9a4d"],
  ["#4a169c", "#d45cf0"],
  ["#2a1aa8", "#7f5bff"],
  ["#151f9c", "#4f7dff"],
  ["#0e2284", "#2fa0ff"],
];
const BASE = lin("#0a1648");

const angle = -0.42;
const ca = Math.cos(angle), sa = Math.sin(angle);
const LAYER_GAP = 118;

// A long run of sheets down the canvas, cycling through the palette so every region has colour.
const layers = [];
const count = Math.ceil((H + W) / LAYER_GAP) + 8;
for (let i = 0; i < count; i++) {
  const cycle = i / 9;
  const idx = i % SHEETS.length;
  const [body, edge] = SHEETS[idx];
  layers.push({
    y: -W * 0.55 + i * LAYER_GAP + (rnd() - 0.5) * 60,
    a1: 90 + rnd() * 90, k1: 0.0016 + rnd() * 0.0011, p1: rnd() * 6.28,
    a2: 34 + rnd() * 40, k2: 0.0041 + rnd() * 0.002, p2: rnd() * 6.28,
    a3: 10 + rnd() * 12, k3: 0.011 + rnd() * 0.004, p3: rnd() * 6.28,
    body: lin(body), edge: lin(edge),
    falloff: 34 + rnd() * 62,
    cycle,
  });
}

const buf = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const u = x * ca - y * sa;
    const v = x * sa + y * ca;
    // Low-frequency warp so the folds feel like cloth rather than sine waves.
    const wu = u + 90 * Math.sin(v * 0.0019 + 1.3) + 40 * Math.sin(v * 0.0052 + 0.2);
    const wv = v + 70 * Math.sin(u * 0.0014 + 2.1);
    let col = BASE.slice();
    for (const l of layers) {
      const edgeY =
        l.y +
        l.a1 * Math.sin(wu * l.k1 + l.p1) +
        l.a2 * Math.sin(wu * l.k2 + l.p2) +
        l.a3 * Math.sin(wu * l.k3 + l.p3);
      const d = wv - edgeY;
      if (d < -220) continue;
      // Soft shadow this sheet throws on everything behind it.
      if (d < 0) {
        const sh = Math.exp(d / 90) * 0.42;
        col = col.map((c) => c * (1 - sh));
        continue;
      }
      const cover = smooth(0, 2.2, d);
      const lit = Math.exp(-d / l.falloff);
      const roll = Math.exp(-((d - 4) ** 2) / 40) * 0.42; // thin bright rim on the fold
      let c = mix(l.body, l.edge, lit);
      c = c.map((v) => v + roll * (1 - v) * 0.55);
      col = mix(col, c, cover);
    }
    const i = (y * W + x) * 3;
    const n = (Math.random() - 0.5) * 1.6; // dither against banding
    for (let k = 0; k < 3; k++) {
      buf[i + k] = Math.max(0, Math.min(255, lin2srgb(Math.min(1, col[k])) * 255 + n));
    }
  }
}
await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 6 }).toFile(out);
console.log("wrote", out, W, H);
