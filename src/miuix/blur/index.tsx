import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx, mergeStyles } from "../utils";

export type DeviceTilt = { x: number; y: number };

export type BlendColorEntry = {
  /** CSS color (already alpha-premultiplied form, e.g. "rgba(189,189,189,0.902)"). */
  color: string;
  /** CSS mix-blend-mode used to emulate the Skia blend mode. */
  blend: CSSProperties["mixBlendMode"];
};

export type BlurColors = {
  /** Overlay color layers drawn over the blurred backdrop, bottom-to-top. */
  blendColors: BlendColorEntry[];
  /** Brightness adjustment in [-1, 1]; 0 = no change. */
  brightness: number;
  /** Contrast multiplier; 1 = no change. */
  contrast: number;
  /** Saturation multiplier; 1 = no change. */
  saturation: number;
};

/** Mirrors top.yukonga.miuix.kmp.blur.BlurDefaults. */
export const BlurDefaults = {
  /** Default blur radius in dp (== px on web). */
  BlurRadius: 20,
  /** Default noise dithering coefficient. */
  NoiseCoefficient: 0.0045,
  /** Maximum allowed blur radius in dp. */
  MaxBlurRadius: 150,
};

export function blurColors(partial: Partial<BlurColors> = {}): BlurColors {
  return {
    blendColors: partial.blendColors ?? [],
    brightness: partial.brightness ?? 0,
    contrast: partial.contrast ?? 1,
    saturation: partial.saturation ?? 1,
  };
}

export function isRuntimeShaderSupported() {
  return typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "blur(1px)");
}

/** No-op compat shim kept so any external imports stay valid. */
export function rememberLayerBackdrop() {
  return { supported: isRuntimeShaderSupported() };
}

/**
 * ColorBlendToken — light-theme tokens from ColorBlendToken.kt.
 * Each token's CSS layers are listed bottom-to-top, matching the Kotlin
 * blendColors draw order. Skia blend modes are mapped to the closest CSS
 * mix-blend-mode (Overlay→overlay, SoftLight→soft-light, HardLight→hard-light,
 * ColorDodge→color-dodge, ColorBurn→color-burn, Luminosity→luminosity,
 * PlusLighter→screen, PlusDarker→multiply, SrcOver→normal,
 * LinearLight→hard-light, Lab→hue).
 */
export const ColorBlendTokenLight = {
  None: [] as BlendColorEntry[],
  InfoThin: [{ color: "rgba(30,30,30,0.502)", blend: "screen" as const }],
  InfoRegular: [{ color: "rgba(20,20,20,0.702)", blend: "screen" as const }],
  ColoredThin: [
    { color: "rgba(28,28,28,0.6)", blend: "overlay" as const },
    { color: "rgba(43,43,43,0.502)", blend: "soft-light" as const },
  ],
  ColoredRegular: [
    { color: "rgba(63,63,63,0.502)", blend: "overlay" as const },
    { color: "rgba(230,230,230,0.11)", blend: "screen" as const },
  ],
  ColoredThick: [
    { color: "rgba(189,189,189,0.902)", blend: "overlay" as const },
    { color: "rgba(43,43,43,0.6)", blend: "color-dodge" as const },
    { color: "rgba(156,156,156,0.2)", blend: "normal" as const },
  ],
  PuredRegular: [
    { color: "rgba(0,52,249,0.204)", blend: "overlay" as const },
    { color: "rgba(255,255,255,0.702)", blend: "hard-light" as const },
  ],
  PuredThick: [
    { color: "rgba(0,0,0,0.302)", blend: "overlay" as const },
    { color: "rgba(0,0,0,0.502)", blend: "normal" as const },
  ],
  OverlayThin: [
    { color: "rgba(169,169,169,0.302)", blend: "luminosity" as const },
    { color: "rgba(156,156,156,0.102)", blend: "multiply" as const },
  ],
  OverlayThick: [
    { color: "rgba(168,168,168,0.659)", blend: "luminosity" as const },
    { color: "rgba(154,154,154,1)", blend: "overlay" as const },
  ],
  LogoBlend: [
    { color: "rgba(74,74,74,0.8)", blend: "color-burn" as const },
    { color: "rgba(79,79,79,1)", blend: "hard-light" as const },
    { color: "rgba(26,242,0,1)", blend: "hue" as const },
  ],
  InfoColored: [
    { color: "rgba(156,39,176,1)", blend: "color-dodge" as const },
    { color: "rgba(255,255,255,0.059)", blend: "screen" as const },
  ],
};

/** Texture-blur Blend Mode dropdown options (BlurSection.kt), default index 5. */
export const TEXTURE_BLEND_OPTIONS: Array<{ label: string; token: BlendColorEntry[] }> = [
  { label: "无", token: ColorBlendTokenLight.None },
  { label: "信息薄", token: ColorBlendTokenLight.InfoThin },
  { label: "信息常规", token: ColorBlendTokenLight.InfoRegular },
  { label: "彩色薄", token: ColorBlendTokenLight.ColoredThin },
  { label: "彩色常规", token: ColorBlendTokenLight.ColoredRegular },
  { label: "彩色厚", token: ColorBlendTokenLight.ColoredThick },
  { label: "纯色常规", token: ColorBlendTokenLight.PuredRegular },
  { label: "纯色厚", token: ColorBlendTokenLight.PuredThick },
  { label: "叠加薄", token: ColorBlendTokenLight.OverlayThin },
  { label: "叠加厚", token: ColorBlendTokenLight.OverlayThick },
];

/** Foreground-blur Blend Mode dropdown options (BlurSection.kt), default index 1. */
export const FOREGROUND_BLEND_OPTIONS: Array<{ label: string; token: BlendColorEntry[] }> = [
  { label: "无", token: ColorBlendTokenLight.None },
  { label: "Logo 混合", token: ColorBlendTokenLight.LogoBlend },
  { label: "彩色薄", token: ColorBlendTokenLight.ColoredThin },
  { label: "彩色常规", token: ColorBlendTokenLight.ColoredRegular },
  { label: "彩色厚", token: ColorBlendTokenLight.ColoredThick },
  { label: "纯色常规", token: ColorBlendTokenLight.PuredRegular },
  { label: "叠加薄", token: ColorBlendTokenLight.OverlayThin },
  { label: "信息彩色", token: ColorBlendTokenLight.InfoColored },
];

/** Effect Variant dropdown (BlurSection.kt), default OS3. */
export const EFFECT_VARIANT_OPTIONS = ["OS2", "OS3"];

/**
 * Builds the CSS filter string for a texture/foreground blur region.
 * The runtime-shader radius maps to a CSS gaussian sigma of roughly radius/2
 * (Skia kernel radius ≈ 2σ), clamped at BlurDefaults.MaxBlurRadius like the
 * Kotlin implementation.
 */
export function blurFilterCss(radius: number, colors: BlurColors): string {
  const px = Math.max(0, Math.min(BlurDefaults.MaxBlurRadius, radius)) / 2;
  return [
    `blur(${px.toFixed(2)}px)`,
    `saturate(${colors.saturation})`,
    `brightness(${1 + colors.brightness})`,
    `contrast(${colors.contrast})`,
  ].join(" ");
}

/**
 * Shared animated gradient-mesh state (port of BgEffectBackground + BgEffectConfig).
 * Returns the CSS `background`/`transition` for the current cross-fade stage so
 * multiple layers (e.g. the stage background AND the blurred copy inside a
 * foreground mask) can render the SAME mesh in perfect sync.
 */
export function useBgEffectMesh(
  variant: "OS2" | "OS3",
  dynamic: boolean,
  dark = false,
): { background: string; transition: string | undefined } {
  const stages = useMemo(() => meshStages(variant, dark), [variant, dark]);
  const animates = variant === "OS3" && dynamic;
  // Stage cross-fade interval (ms): OS3 light 2500, OS3 dark 4000.
  const intervalMs = dark ? 4000 : 2500;

  const [stage, setStage] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!animates) return;
    timer.current = setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, intervalMs);
    return () => {
      if (timer.current != null) clearInterval(timer.current);
    };
  }, [animates, intervalMs, stages.length]);

  return {
    background: stages[animates ? stage % stages.length : 0],
    // spring(dampingRatio=0.9, stiffness=35) approximated by a slow, slightly
    // overshooting ease over ~3s.
    transition: animates ? "background 3000ms cubic-bezier(0.34, 1.06, 0.64, 1)" : undefined,
  };
}

/**
 * Animated gradient-mesh background. OS2 has a single static stage (Kotlin:
 * colors1==colors2==colors3 so animatesColors=false). Dark/light via `dark`.
 */
export function BgEffectBackground({
  variant,
  dynamic,
  dark = false,
  className,
  style,
}: {
  variant: "OS2" | "OS3";
  dynamic: boolean;
  dark?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const mesh = useBgEffectMesh(variant, dynamic, dark);
  return (
    <div
      className={cx("demo-bg-effect", className)}
      style={mergeStyles({ background: mesh.background, transition: mesh.transition }, style)}
    />
  );
}

/** 4-corner radial-gradient mesh strings for each color cycle frame. */
function meshStages(variant: "OS2" | "OS3", dark: boolean): string[] {
  // Corner positions (x%, y%) from BgEffectConfig points.
  const pts: number[][] =
    variant === "OS3"
      ? [
          [80, 20],
          [80, 90],
          [20, 90],
          [20, 20],
        ]
      : dark
        ? [
            [63, 50],
            [69, 75],
            [17, 66],
            [14, 24],
          ]
        : [
            [67, 42],
            [69, 75],
            [14, 71],
            [14, 27],
          ];

  // Cycle order matches BgEffectPainter.colorsForCycleIndex: 2,1,2,3 (period 4),
  // starting on colors2.
  let cycle: string[][];
  if (variant === "OS3" && !dark) {
    const c1 = ["#ffe6f0", "#ffd6e3", "#f7bad1", "#a3a6fa"];
    const c2 = ["#94bcff", "#ffe6ed", "#bdc2ff", "#f7c4d6"];
    const c3 = ["#fadbe6", "#99baf7", "#ebedff", "#8fb0ff"];
    cycle = [c2, c1, c2, c3];
  } else if (variant === "OS3" && dark) {
    const c1 = ["rgba(51,15,224,.4)", "rgba(77,36,140,.5)", "rgba(0,163,245,.5)", "rgba(28,41,212,.4)"];
    const c2 = ["rgba(18,38,201,.5)", "rgba(158,54,171,.5)", "rgba(15,64,214,.5)", "rgba(0,51,199,.5)"];
    const c3 = ["rgba(148,77,189,.4)", "rgba(69,46,153,.5)", "rgba(168,66,158,.5)", "rgba(31,41,179,.6)"];
    cycle = [c2, c1, c2, c3];
  } else if (variant === "OS2" && !dark) {
    cycle = [["#91c2fa", "#fad9ad", "#fabfed", "#bab3fa"]];
  } else {
    cycle = [["#004f94", "#874a26", "#750f44", "#291f73"]];
  }

  const base = "var(--miuix-surface)";
  return cycle.map((cs) => {
    const blobs = cs
      .map((c, i) => {
        const [x, y] = pts[i];
        return `radial-gradient(120% 120% at ${x}% ${y}%, ${c} 0%, transparent 60%)`;
      })
      .join(", ");
    return `${blobs}, ${base}`;
  });
}

/** Legacy export kept for compatibility with any other importer. */
export function LayerBackdrop({
  children,
  radius = BlurDefaults.BlurRadius,
  style,
  className,
}: {
  children: ReactNode;
  radius?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const backdropStyle = useMemo<CSSProperties>(
    () => ({
      backdropFilter: `blur(${radius}px) saturate(1.35)`,
      WebkitBackdropFilter: `blur(${radius}px) saturate(1.35)`,
    }),
    [radius],
  );
  return (
    <div className={cx("miuix-blur-layer", className)} style={mergeStyles(backdropStyle, style)}>
      {children}
    </div>
  );
}
