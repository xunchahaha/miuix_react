import { clamp } from "./utils";

export type Hsv = { h: number; s: number; v: number };
export type OkHsv = Hsv;
export type OkLab = { l: number; a: number; b: number };
export type OkLch = { l: number; c: number; h: number };
export type Rgba = { r: number; g: number; b: number; a: number };

export type Transforms = {
  toHsv: typeof toHsv;
  toOkLab: typeof toOkLab;
  toOkLch: typeof toOkLch;
};

export const ColorSpace = {
  Hsv: "hsv",
  OkHsv: "okhsv",
  OkLab: "oklab",
  OkLch: "oklch",
} as const;

export type ColorSpace = (typeof ColorSpace)[keyof typeof ColorSpace];

export function hexToRgba(hex: string): Rgba {
  const clean = hex.replace("#", "").trim();
  const normalized = clean.length === 3
    ? clean.split("").map((part) => part + part).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(normalized, 16);
  const alphaHex = clean.length >= 8 ? clean.slice(6, 8) : null;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
    a: alphaHex ? Number.parseInt(alphaHex, 16) / 255 : 1,
  };
}

export function rgbaToHex({ r, g, b }: Rgba): string {
  return `#${[r, g, b].map((part) => clamp(Math.round(part), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

// 8-digit RRGGBBAA hex (alpha always emitted). Matches the demo's hexToRgba
// which reads a trailing 2-hex alpha byte.
export function rgbaToHex8({ r, g, b, a }: Rgba): string {
  const part = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}${part(clamp(a, 0, 1) * 255)}`;
}

export function toHsv(color: string): Hsv {
  const { r, g, b } = hexToRgba(color);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const h = delta === 0
    ? 0
    : max === rn
      ? 60 * (((gn - bn) / delta) % 6)
      : max === gn
        ? 60 * ((bn - rn) / delta + 2)
        : 60 * ((rn - gn) / delta + 4);
  return {
    h: (h + 360) % 360,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [rn, gn, bn] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] :
    [c, 0, x];
  return rgbaToHex({ r: (rn + m) * 255, g: (gn + m) * 255, b: (bn + m) * 255, a: 1 });
}

// HSV (h in degrees 0..360, s/v in 0..1) -> normalized sRGB [r,g,b] in 0..1.
export function hsvToRgb01(h: number, s: number, v: number): [number, number, number] {
  const hh = (((h % 360) + 360) % 360);
  const c = v * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = v - c;
  const [rn, gn, bn] =
    hh < 60 ? [c, x, 0] :
    hh < 120 ? [x, c, 0] :
    hh < 180 ? [0, c, x] :
    hh < 240 ? [0, x, c] :
    hh < 300 ? [x, 0, c] :
    [c, 0, x];
  return [rn + m, gn + m, bn + m];
}

export function toOkLab(color: string): OkLab {
  const { r, g, b } = hexToRgba(color);
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function toOkLch(color: string): OkLch {
  const lab = toOkLab(color);
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  const h = (Math.atan2(lab.b, lab.a) * 180 / Math.PI + 360) % 360;
  return { l: lab.l, c, h };
}

export function okLchToCss({ l, c, h }: OkLch) {
  return `oklch(${clamp(l, 0, 1)} ${Math.max(0, c)} ${h})`;
}

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

// ---- Inverse / OkHSV transforms ported verbatim from color/core/Transforms.kt ----

function srgbTransferFunction(a: number): number {
  return 0.0031308 >= a ? 12.92 * a : 1.055 * Math.pow(a, 0.4166666666666667) - 0.055;
}

function srgbTransferFunctionInv(a: number): number {
  return 0.04045 < a ? Math.pow((a + 0.055) / 1.055, 2.4) : a / 12.92;
}

function linearSrgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lc = Math.cbrt(l);
  const mc = Math.cbrt(m);
  const sc = Math.cbrt(s);
  return [
    0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc,
    1.9779984951 * lc - 2.428592205 * mc + 0.4505937099 * sc,
    0.0259040371 * lc + 0.7827717662 * mc - 0.808675766 * sc,
  ];
}

function oklabToLinearSrgb(l: number, a: number, b: number): [number, number, number] {
  const lc = l + 0.3963377774 * a + 0.2158037573 * b;
  const mc = l - 0.1055613458 * a - 0.0638541728 * b;
  const sc = l - 0.0894841775 * a - 1.291485548 * b;
  const ll = lc * lc * lc;
  const mm = mc * mc * mc;
  const ss = sc * sc * sc;
  return [
    4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss,
    -0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss,
  ];
}

// OkLab (l 0..1, a/b internal ±0.4) -> sRGB 0..1 (clamped).
export function okLabInternalToRgb01(l: number, a: number, b: number): [number, number, number] {
  const l1 = l + 0.3963377774 * a + 0.2158037573 * b;
  const m1 = l - 0.1055613458 * a - 0.0638541728 * b;
  const s1 = l - 0.0894841775 * a - 1.291485548 * b;
  const ll = l1 * l1 * l1;
  const mm = m1 * m1 * m1;
  const ss = s1 * s1 * s1;
  return [
    clamp(4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss, 0, 1),
    clamp(-1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss, 0, 1),
    clamp(-0.0041960863 * ll - 0.7034186147 * mm + 1.707614701 * ss, 0, 1),
  ];
}

// OkLch (l 0..1, c internal 0..0.4, h degrees) -> sRGB 0..1 (clamped).
export function okLchInternalToRgb01(l: number, c: number, h: number): [number, number, number] {
  const ln = clamp(l, 0, 1);
  const cn = clamp(c, 0, 0.4);
  let hn = h % 360;
  if (hn < 0) hn += 360;
  const hRad = (hn * Math.PI) / 180;
  const a = cn * Math.cos(hRad);
  const b = cn * Math.sin(hRad);
  return okLabInternalToRgb01(ln, a, b);
}

function toe(x: number): number {
  const k1 = 0.206;
  const k2 = 0.03;
  const k3 = (1 + k1) / (1 + k2);
  return 0.5 * (k3 * x - k1 + Math.sqrt((k3 * x - k1) * (k3 * x - k1) + 4 * k2 * k3 * x));
}

function toeInv(x: number): number {
  const k1 = 0.206;
  const k2 = 0.03;
  const k3 = (1 + k1) / (1 + k2);
  return (x * x + k1 * x) / (k3 * (x + k2));
}

function computeMaxSaturation(a: number, b: number): number {
  let k0: number, k1: number, k2: number, k3: number, k4: number, wl: number, wm: number, ws: number;
  if (-1.88170328 * a - 0.80936493 * b > 1) {
    k0 = 1.19086277; k1 = 1.76576728; k2 = 0.59662641; k3 = 0.75515197; k4 = 0.56771245;
    wl = 4.0767416621; wm = -3.3077115913; ws = 0.2309699292;
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    k0 = 0.73956515; k1 = -0.45954404; k2 = 0.08285427; k3 = 0.1254107; k4 = 0.14503204;
    wl = -1.2684380046; wm = 2.6097574011; ws = -0.3413193965;
  } else {
    k0 = 1.35733652; k1 = -0.00915799; k2 = -1.1513021; k3 = -0.50559606; k4 = 0.00692167;
    wl = -0.0041960863; wm = -0.7034186147; ws = 1.707614701;
  }
  let s = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;
  const kL = 0.3963377774 * a + 0.2158037573 * b;
  const kM = -0.1055613458 * a - 0.0638541728 * b;
  const kS = -0.0894841775 * a - 1.291485548 * b;
  const lc = 1 + s * kL;
  const mc = 1 + s * kM;
  const sc = 1 + s * kS;
  const ll = lc * lc * lc;
  const mm = mc * mc * mc;
  const ss = sc * sc * sc;
  const lDs = 3 * kL * lc * lc;
  const mDs = 3 * kM * mc * mc;
  const sDs = 3 * kS * sc * sc;
  const lDs2 = 6 * kL * kL * lc;
  const mDs2 = 6 * kM * kM * mc;
  const sDs2 = 6 * kS * kS * sc;
  const f = wl * ll + wm * mm + ws * ss;
  const f1 = wl * lDs + wm * mDs + ws * sDs;
  const f2 = wl * lDs2 + wm * mDs2 + ws * sDs2;
  s -= (f * f1) / (f1 * f1 - 0.5 * f * f2);
  return s;
}

function findCusp(a: number, b: number): [number, number] {
  const sCusp = computeMaxSaturation(a, b);
  const rgb = oklabToLinearSrgb(1, sCusp * a, sCusp * b);
  const lCusp = Math.cbrt(1 / Math.max(rgb[0], rgb[1], rgb[2]));
  return [lCusp, lCusp * sCusp];
}

function getSTMax(a: number, b: number): [number, number] {
  const [l, c] = findCusp(a, b);
  return [c / l, c / (1 - l)];
}

// OkHSV (h,s,v all 0..1) -> sRGB 0..1.
export function okhsvToRgb01(h: number, s: number, v: number): [number, number, number] {
  const a = Math.cos(2 * Math.PI * h);
  const b = Math.sin(2 * Math.PI * h);
  const [sMax, tMax] = getSTMax(a, b);
  const s0 = 0.5;
  const k = 1 - s0 / sMax;
  const lv = 1 - (s * s0) / (s0 + tMax - tMax * k * s);
  const cv = (s * tMax * s0) / (s0 + tMax - tMax * k * s);
  let l = v * lv;
  let c = v * cv;
  const lvt = toeInv(lv);
  const cvt = (cv * lvt) / lv;
  const lNew = toeInv(l);
  c = (c * lNew) / l;
  l = lNew;
  const rgbScale = oklabToLinearSrgb(lvt, a * cvt, b * cvt);
  const scaleL = Math.cbrt(1 / Math.max(rgbScale[0], rgbScale[1], rgbScale[2], 0));
  l *= scaleL;
  c *= scaleL;
  const rgb = oklabToLinearSrgb(l, c * a, c * b);
  return [
    clamp(srgbTransferFunction(rgb[0]), 0, 1),
    clamp(srgbTransferFunction(rgb[1]), 0, 1),
    clamp(srgbTransferFunction(rgb[2]), 0, 1),
  ];
}

// sRGB 0..1 -> OkHSV (h,s,v all 0..1).
export function rgb01ToOkhsv(r: number, g: number, b: number): OkHsv {
  const lab = linearSrgbToOklab(
    srgbTransferFunctionInv(r),
    srgbTransferFunctionInv(g),
    srgbTransferFunctionInv(b),
  );
  const c = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  const a = c === 0 ? 0 : lab[1] / c;
  const bb = c === 0 ? 0 : lab[2] / c;
  const l = lab[0];
  const h = 0.5 + (0.5 * Math.atan2(-lab[2], -lab[1])) / Math.PI;
  const [sMax, tMax] = getSTMax(a, bb);
  const s0 = 0.5;
  const k = 1 - s0 / sMax;
  const t = tMax / (c + l * tMax);
  const lv = t * l;
  const cv = t * c;
  const lvt = toeInv(lv);
  const cvt = (cv * lvt) / lv;
  const rgbScale = oklabToLinearSrgb(lvt, a * cvt, bb * cvt);
  const scaleL = Math.cbrt(1 / Math.max(rgbScale[0], rgbScale[1], rgbScale[2], 0));
  let l2 = l / scaleL;
  l2 = toe(l2);
  const v = l2 / lv;
  const s = ((s0 + tMax) * cv) / (tMax * s0 + tMax * k * cv);
  return { h, s, v };
}

export function toOkHsv(color: string): OkHsv {
  const { r, g, b } = hexToRgba(color);
  return rgb01ToOkhsv(r / 255, g / 255, b / 255);
}

// --- helpers used by ColorPicker UI ---

export function rgb01ToHex(rgb: [number, number, number]): string {
  const safe = (n: number) => (Number.isFinite(n) ? n : 0);
  return rgbaToHex({ r: safe(rgb[0]) * 255, g: safe(rgb[1]) * 255, b: safe(rgb[2]) * 255, a: 1 });
}

// CSS rgba() from 0..1 components.
export function rgba01ToCss(rgb: [number, number, number], alpha: number): string {
  const part = (n: number) => clamp(Math.round((Number.isFinite(n) ? n : 0) * 255), 0, 255);
  return `rgba(${part(rgb[0])}, ${part(rgb[1])}, ${part(rgb[2])}, ${clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1)})`;
}
