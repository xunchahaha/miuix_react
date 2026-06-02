// Copyright 2026, compose-miuix-ui contributors
// SPDX-License-Identifier: Apache-2.0

import { darkColorScheme, lightColorScheme, TopAppBar, useMiuixTheme, type MiuixColors } from "../../miuix";
import { DemoCard, DemoSection } from "../section";

// Splits a camelCase token name into spaced words for display.
function displayName(name: string) {
  return name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

function relativeLuminance(color: string): number {
  const match = /^#?([0-9a-fA-F]{6})/.exec(color.trim());
  if (!match) return 0.5;
  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ColorsPreview({ colors }: { colors: MiuixColors }) {
  const entries = COLOR_KEYS.map((name) => [name, colors[name]] as [keyof MiuixColors, string]);
  const map = new Map<string, string>(entries.map(([name, color]) => [name, color]));

  const textColorFor = (name: string, color: string): string => {
    if (name.startsWith("on")) {
      const base = name.slice(2).replace(/^./, (c) => c.toLowerCase());
      if (map.has(base)) return map.get(base)!;
    } else {
      const onName = "on" + name.replace(/^./, (c) => c.toUpperCase());
      if (map.has(onName)) return map.get(onName)!;
    }
    return relativeLuminance(color) > 0.5 ? "#000000" : "#ffffff";
  };

  return (
    <div className="demo-color-grid">
      {entries.map(([name, color]) => (
        <div
          key={name}
          className="demo-color-block"
          style={{ background: color, color: textColorFor(name, color), borderColor: textColorFor(name, color) }}
        >
          {displayName(name)}
        </div>
      ))}
    </div>
  );
}

const COLOR_KEYS: Array<keyof MiuixColors> = [
  "primary",
  "onPrimary",
  "primaryVariant",
  "onPrimaryVariant",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "disabledPrimary",
  "disabledOnPrimary",
  "disabledPrimaryButton",
  "disabledOnPrimaryButton",
  "disabledPrimarySlider",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "onSecondary",
  "secondaryVariant",
  "onSecondaryVariant",
  "disabledSecondary",
  "disabledOnSecondary",
  "disabledSecondaryVariant",
  "disabledOnSecondaryVariant",
  "secondaryContainer",
  "onSecondaryContainer",
  "secondaryContainerVariant",
  "onSecondaryContainerVariant",
  "tertiaryContainer",
  "onTertiaryContainer",
  "tertiaryContainerVariant",
  "background",
  "onBackground",
  "onBackgroundVariant",
  "surface",
  "onSurface",
  "surfaceVariant",
  "onSurfaceSecondary",
  "onSurfaceVariantSummary",
  "onSurfaceVariantActions",
  "disabledOnSurface",
  "surfaceContainer",
  "onSurfaceContainer",
  "onSurfaceContainerVariant",
  "surfaceContainerHigh",
  "onSurfaceContainerHigh",
  "surfaceContainerHighest",
  "onSurfaceContainerHighest",
  "outline",
  "dividerLine",
  "windowDimming",
  "sliderKeyPoint",
  "sliderKeyPointForeground",
];

const dynamicLightColorScheme: MiuixColors = {
  ...lightColorScheme,
  primary: "#6750a4",
  primaryVariant: "#6750a4",
  onPrimaryVariant: "#d9ccff",
  primaryContainer: "#7f67be",
  tertiaryContainer: "#f0eaff",
  onTertiaryContainer: "#6750a4",
};

const dynamicDarkColorScheme: MiuixColors = {
  ...darkColorScheme,
  primary: "#d0bcff",
  primaryVariant: "#cbb6ff",
  onPrimaryVariant: "#4f378b",
  primaryContainer: "#7f67be",
  tertiaryContainer: "#3e315b",
  onTertiaryContainer: "#d0bcff",
};

export function ColorPage() {
  const theme = useMiuixTheme();

  return (
    <div className="demo-page">
      <TopAppBar className="demo-page-topbar" small title="颜色" />
      <DemoSection title="当前主题颜色">
        <DemoCard inset>
          <ColorsPreview colors={theme.colors} />
        </DemoCard>
      </DemoSection>
      <DemoSection title="浅色主题颜色">
        <DemoCard inset>
          <ColorsPreview colors={lightColorScheme} />
        </DemoCard>
      </DemoSection>
      <DemoSection title="动态浅色主题颜色">
        <DemoCard inset>
          <ColorsPreview colors={dynamicLightColorScheme} />
        </DemoCard>
      </DemoSection>
      <DemoSection title="深色主题颜色">
        <DemoCard inset>
          <ColorsPreview colors={darkColorScheme} />
        </DemoCard>
      </DemoSection>
      <DemoSection title="动态深色主题颜色">
        <DemoCard inset>
          <ColorsPreview colors={dynamicDarkColorScheme} />
        </DemoCard>
      </DemoSection>
    </div>
  );
}
