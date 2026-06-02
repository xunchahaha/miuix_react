export type Platform = "android" | "ios" | "desktop" | "macos" | "web" | "unknown";

export function currentPlatform(): Platform {
  const electronPlatform = window.miuixElectron?.platform;
  if (electronPlatform === "darwin") {
    return "macos";
  }
  if (electronPlatform === "win32" || electronPlatform === "linux") {
    return "desktop";
  }
  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) return "android";
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "ios";
    return "web";
  }
  return "unknown";
}

export function getCornerRadiusBottom() {
  return 0;
}

export function getCornerRadiusTop() {
  return 0;
}

export * from "../utils";
