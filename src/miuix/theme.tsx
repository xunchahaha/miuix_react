import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";

export type ColorSchemeMode = "light" | "dark" | "system";

export type MiuixColors = {
  primary: string;
  onPrimary: string;
  primaryVariant: string;
  onPrimaryVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  disabledPrimary: string;
  disabledOnPrimary: string;
  disabledPrimaryButton: string;
  disabledOnPrimaryButton: string;
  disabledPrimarySlider: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryVariant: string;
  onSecondaryVariant: string;
  disabledSecondary: string;
  disabledOnSecondary: string;
  disabledSecondaryVariant: string;
  disabledOnSecondaryVariant: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  secondaryContainerVariant: string;
  onSecondaryContainerVariant: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  tertiaryContainerVariant: string;
  background: string;
  onBackground: string;
  onBackgroundVariant: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceSecondary: string;
  onSurfaceVariantSummary: string;
  onSurfaceVariantActions: string;
  disabledOnSurface: string;
  surfaceContainer: string;
  onSurfaceContainer: string;
  onSurfaceContainerVariant: string;
  surfaceContainerHigh: string;
  onSurfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurfaceContainerHighest: string;
  outline: string;
  dividerLine: string;
  windowDimming: string;
  sliderKeyPoint: string;
  sliderKeyPointForeground: string;
  sliderBackground: string;
};

export type MiuixTextStyles = {
  main: CSSProperties;
  paragraph: CSSProperties;
  body1: CSSProperties;
  body2: CSSProperties;
  button: CSSProperties;
  footnote1: CSSProperties;
  footnote2: CSSProperties;
  headline1: CSSProperties;
  headline2: CSSProperties;
  subtitle: CSSProperties;
  title1: CSSProperties;
  title2: CSSProperties;
  title3: CSSProperties;
  title4: CSSProperties;
};

export type TextStyles = MiuixTextStyles;

export type MiuixThemeValue = {
  mode: Exclude<ColorSchemeMode, "system">;
  colors: MiuixColors;
  textStyles: MiuixTextStyles;
};

export type ThemeColorSpec = "spec2021" | "spec2025";
export type ThemePaletteStyle = "tonalSpot" | "vibrant" | "expressive" | "content";

export type ThemeController = {
  colorSchemeMode: ColorSchemeMode;
  currentColors: () => MiuixColors;
};

export const lightColorScheme: MiuixColors = {
  primary: "#3482ff",
  onPrimary: "#ffffff",
  primaryVariant: "#3482ff",
  onPrimaryVariant: "#aecdff",
  error: "#e94634",
  onError: "#ffffff",
  errorContainer: "#fdf6f4",
  onErrorContainer: "#410002",
  disabledPrimary: "#c2d9ff",
  disabledOnPrimary: "#f3f8ff",
  disabledPrimaryButton: "#c2d9ff",
  disabledOnPrimaryButton: "#ffffff",
  disabledPrimarySlider: "#b8cff5",
  primaryContainer: "#5d9bff",
  onPrimaryContainer: "#ffffff",
  secondary: "#e6e6e6",
  onSecondary: "#ffffff",
  secondaryVariant: "#f0f0f0",
  onSecondaryVariant: "#303030",
  disabledSecondary: "#f0f0f0",
  disabledOnSecondary: "#fcfcfc",
  disabledSecondaryVariant: "#f2f2f2",
  disabledOnSecondaryVariant: "#b2b2b2",
  secondaryContainer: "#f0f0f0",
  onSecondaryContainer: "#a9a9a9",
  secondaryContainerVariant: "#f0f0f0",
  onSecondaryContainerVariant: "#a8a8a8",
  tertiaryContainer: "#eaf2ff",
  onTertiaryContainer: "#3482ff",
  tertiaryContainerVariant: "#eaf2ff",
  background: "#ffffff",
  onBackground: "#191919",
  onBackgroundVariant: "#8c93b0",
  surface: "#f7f7f7",
  onSurface: "#191919",
  surfaceVariant: "#ffffff",
  onSurfaceSecondary: "rgba(0, 0, 0, 0.8)",
  onSurfaceVariantSummary: "rgba(0, 0, 0, 0.6)",
  onSurfaceVariantActions: "rgba(0, 0, 0, 0.4)",
  disabledOnSurface: "#b2b2b2",
  surfaceContainer: "#ffffff",
  onSurfaceContainer: "#191919",
  onSurfaceContainerVariant: "#959595",
  surfaceContainerHigh: "#e8e8e8",
  onSurfaceContainerHigh: "#a2a2a2",
  surfaceContainerHighest: "#e8e8e8",
  onSurfaceContainerHighest: "#191919",
  outline: "#d9d9d9",
  dividerLine: "#e0e0e0",
  windowDimming: "rgba(0, 0, 0, 0.32)",
  sliderKeyPoint: "rgba(163, 179, 205, 0.3)",
  sliderKeyPointForeground: "#6eb5ff",
  sliderBackground: "rgba(0, 0, 0, 0.06)",
};

export const darkColorScheme: MiuixColors = {
  primary: "#277af7",
  onPrimary: "#ffffff",
  primaryVariant: "#0073dd",
  onPrimaryVariant: "#99c7f1",
  error: "#f12522",
  onError: "#ffffff",
  errorContainer: "#2e0603",
  onErrorContainer: "#ffdad6",
  disabledPrimary: "#253e64",
  disabledOnPrimary: "#677993",
  disabledPrimaryButton: "#253e64",
  disabledOnPrimaryButton: "#677893",
  disabledPrimarySlider: "#44587c",
  primaryContainer: "#338fe4",
  onPrimaryContainer: "#ffffff",
  secondary: "#505050",
  onSecondary: "#ffffff",
  secondaryVariant: "#434343",
  onSecondaryVariant: "#d9d9d9",
  disabledSecondary: "#3f3f3f",
  disabledOnSecondary: "#797979",
  disabledSecondaryVariant: "#404040",
  disabledOnSecondaryVariant: "#707170",
  secondaryContainer: "#434343",
  onSecondaryContainer: "#7c7c7c",
  secondaryContainerVariant: "#4f4f4f",
  onSecondaryContainerVariant: "#959595",
  tertiaryContainer: "#2b3b54",
  onTertiaryContainer: "#4788ff",
  tertiaryContainerVariant: "#505050",
  background: "#242424",
  onBackground: "rgba(255, 255, 255, 0.9)",
  onBackgroundVariant: "#787e96",
  surface: "#1f1f1f",
  onSurface: "#f2f2f2",
  surfaceVariant: "#242424",
  onSurfaceSecondary: "rgba(255, 255, 255, 0.8)",
  onSurfaceVariantSummary: "rgba(255, 255, 255, 0.5)",
  onSurfaceVariantActions: "rgba(255, 255, 255, 0.4)",
  disabledOnSurface: "#666666",
  surfaceContainer: "#242424",
  onSurfaceContainer: "rgba(255, 255, 255, 0.9)",
  onSurfaceContainerVariant: "#737373",
  surfaceContainerHigh: "#242424",
  onSurfaceContainerHigh: "#666666",
  surfaceContainerHighest: "#2d2d2d",
  onSurfaceContainerHighest: "#e9e9e9",
  outline: "#404040",
  dividerLine: "#393939",
  windowDimming: "rgba(0, 0, 0, 0.56)",
  sliderKeyPoint: "rgba(122, 138, 166, 0.3)",
  sliderKeyPointForeground: "#5daaff",
  sliderBackground: "rgba(255, 255, 255, 0.15)",
};

export const defaultTextStyles: MiuixTextStyles = {
  main: { fontSize: 17 },
  paragraph: { fontSize: 17, lineHeight: 1.2 },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  button: { fontSize: 17 },
  footnote1: { fontSize: 13 },
  footnote2: { fontSize: 11 },
  headline1: { fontSize: 17 },
  headline2: { fontSize: 16 },
  subtitle: { fontSize: 14, fontWeight: 700 },
  title1: { fontSize: 32 },
  title2: { fontSize: 24 },
  title3: { fontSize: 20 },
  title4: { fontSize: 18 },
};

const ThemeContext = createContext<MiuixThemeValue>({
  mode: "light",
  colors: lightColorScheme,
  textStyles: defaultTextStyles,
});

export function createThemeController(mode: ColorSchemeMode = "system"): ThemeController {
  return {
    colorSchemeMode: mode,
    currentColors: () => (resolveMode(mode) === "dark" ? darkColorScheme : lightColorScheme),
  };
}

function resolveMode(mode: ColorSchemeMode): Exclude<ColorSchemeMode, "system"> {
  if (mode !== "system") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function MiuixTheme({
  mode = "system",
  colors,
  textStyles = defaultTextStyles,
  children,
}: {
  mode?: ColorSchemeMode;
  colors?: Partial<MiuixColors>;
  textStyles?: Partial<MiuixTextStyles>;
  children: ReactNode;
}) {
  const resolvedMode = resolveMode(mode);
  const value = useMemo<MiuixThemeValue>(() => {
    const base = resolvedMode === "dark" ? darkColorScheme : lightColorScheme;
    return {
      mode: resolvedMode,
      colors: { ...base, ...colors },
      textStyles: { ...defaultTextStyles, ...textStyles },
    };
  }, [colors, resolvedMode, textStyles]);

  return (
    <ThemeContext.Provider value={value}>
      <div className="miuix-theme" data-miuix-mode={value.mode} style={themeVars(value)}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useMiuixTheme() {
  return useContext(ThemeContext);
}

export function themeVars(theme: MiuixThemeValue): CSSProperties {
  const vars: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`--miuix-${toKebab(key)}`] = value;
  }
  return vars as CSSProperties;
}

function toKebab(value: string) {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
