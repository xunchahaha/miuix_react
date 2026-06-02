import type { CSSProperties } from "react";
import { px, type SizeValue } from "../utils";

export const SquircleDefaults = {
  smoothing: 0.72,
  cornerRadius: 16,
};

export function isSquircleEnabled() {
  return typeof CSS !== "undefined" && CSS.supports("border-radius", "16px");
}

export function squircleStyle(cornerRadius: SizeValue = SquircleDefaults.cornerRadius): CSSProperties {
  return {
    borderRadius: px(cornerRadius),
  };
}

export function squircleClipPath(cornerRadius: SizeValue = SquircleDefaults.cornerRadius) {
  return `inset(0 round ${px(cornerRadius)})`;
}
