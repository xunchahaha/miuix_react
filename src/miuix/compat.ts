import type { CSSProperties } from "react";
import { squircleClipPath, squircleStyle } from "./squircle";
import { mergeStyles, type SizeValue } from "./utils";

export type Colors = Record<string, string>;

export type EndActionColors = {
  color: string;
  disabledColor: string;
};

export type OverScrollState = {
  offset: number;
  isInProgress: boolean;
};

export type MiuixScrollBehavior = {
  offset: number;
  pinned: boolean;
};

export type SinkFeedback = {
  type: "sink";
  amount: number;
};

export type TiltFeedback = {
  type: "tilt";
  amount: number;
};

export const AccelerateEasing = "cubic-bezier(0.4, 0, 1, 1)";
export const DecelerateEasing = "cubic-bezier(0, 0, 0.2, 1)";

export function absoluteSquircleBackground(color: string, cornerRadius?: SizeValue): CSSProperties {
  return mergeStyles(squircleStyle(cornerRadius), { background: color });
}

export function absoluteSquircleClip(cornerRadius?: SizeValue): CSSProperties {
  return {
    clipPath: squircleClipPath(cornerRadius),
  };
}

export function absoluteSquircleSurface(color: string, cornerRadius?: SizeValue): CSSProperties {
  return mergeStyles(absoluteSquircleBackground(color, cornerRadius), absoluteSquircleClip(cornerRadius));
}

export function squircleBackground(color: string, cornerRadius?: SizeValue): CSSProperties {
  return absoluteSquircleBackground(color, cornerRadius);
}

export function squircleBorder(color: string, width = 1, cornerRadius?: SizeValue): CSSProperties {
  return mergeStyles(squircleStyle(cornerRadius), { border: `${width}px solid ${color}` });
}

export function squircleClip(cornerRadius?: SizeValue): CSSProperties {
  return absoluteSquircleClip(cornerRadius);
}

export function squircleSurface(color: string, cornerRadius?: SizeValue): CSSProperties {
  return absoluteSquircleSurface(color, cornerRadius);
}

export function addSquircleRect() {
  return null;
}

export function drawCheckerboard(size = 8): CSSProperties {
  return {
    backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
    backgroundSize: `${size * 2}px ${size * 2}px`,
    backgroundPosition: `0 0, 0 ${size}px, ${size}px -${size}px, -${size}px 0px`,
  };
}

export function blendColors(colors: string[]) {
  return colors.join(", ");
}

export function blur(radius = 16): CSSProperties {
  return {
    backdropFilter: `blur(${radius}px)`,
    WebkitBackdropFilter: `blur(${radius}px)`,
  };
}

export function colorControls(saturation = 1, brightness = 1): CSSProperties {
  return {
    filter: `saturate(${saturation}) brightness(${brightness})`,
  };
}

export function noiseDither(): CSSProperties {
  return {
    backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
    backgroundSize: "3px 3px",
  };
}

export function effect(style: CSSProperties): CSSProperties {
  return style;
}

export function drawBackdrop(style: CSSProperties): CSSProperties {
  return style;
}

export function layerBackdrop(style: CSSProperties): CSSProperties {
  return style;
}

export function runtimeShaderEffect(style: CSSProperties): CSSProperties {
  return style;
}

export function textureEffect(style: CSSProperties): CSSProperties {
  return style;
}

export function textureBlur(radius = 16): CSSProperties {
  return blur(radius);
}

export function textureBlurEffect(radius = 16): CSSProperties {
  return blur(radius);
}

export function asBrush(color: string) {
  return color;
}

export function asComposeShader(shader: unknown) {
  return shader;
}

export function asAndroidRuntimeShader(shader: unknown) {
  return shader;
}

export function asSkikoRuntimeShader(shader: unknown) {
  return shader;
}

export function collectIsHeldDownAsState() {
  return false;
}

export function MiuixIndication() {
  return null;
}

export function MiuixOverscrollFactory() {
  return null;
}

export function MiuixOverscrollEffect() {
  return null;
}

export function MiuixPopupUtils() {
  return null;
}

export function overScrollHorizontal(): CSSProperties {
  return {};
}

export function overScrollVertical(): CSSProperties {
  return {};
}

export function overScrollOutOfBound(): CSSProperties {
  return {};
}

export function pressable(feedback: "sink" | "tilt" | "none" = "sink"): CSSProperties {
  if (feedback === "sink") {
    return { transform: "scale(0.985)" };
  }
  if (feedback === "tilt") {
    return { transform: "perspective(900px) rotateX(1.5deg) scale(0.99)" };
  }
  return {};
}

export function scrollEndHaptic() {
  return undefined;
}

export function rememberTopAppBarState(): MiuixScrollBehavior {
  return {
    offset: 0,
    pinned: false,
  };
}
