import type { CSSProperties } from "react";

export type SizeValue = number | string;

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function px(value: SizeValue | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

export function mergeStyles(...styles: Array<CSSProperties | undefined>) {
  return Object.assign({}, ...styles.filter(Boolean));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
