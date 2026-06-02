import type { LucideIcon } from "lucide-react";
import { MiuixIcons } from "../components";

export type MiuixIconName = keyof typeof MiuixIcons;

export const BasicIcons = MiuixIcons;
export const ExtendedIcons = MiuixIcons;

export function getIcon(name: MiuixIconName): LucideIcon {
  return MiuixIcons[name];
}

export { Icon, MiuixIcons } from "../components";
