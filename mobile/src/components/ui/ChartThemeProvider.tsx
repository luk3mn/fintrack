import { ChartProvider, palettes, type PaletteName } from "expo-charts";
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useThemeColors } from "@/theme/tokens";

/** Single chart skin for the whole app. */
export const CHART_PALETTE: PaletteName = "vivid";

/** Palette colours resolved with the same system light/dark rule as the provider. */
export function useChartPalette() {
  const scheme = useColorScheme();
  return palettes[CHART_PALETTE][scheme === "dark" ? "dark" : "light"];
}

/** Readable text over a palette swatch (chips and accents outside the chart). */
export function chartTextColor(hex: string) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? "#0d0d17" : "#ffffff";
}

/** ChartProvider with the app tokens and the shared vivid palette. */
export function ChartThemeProvider({ children }: { children: ReactNode }) {
  const colors = useThemeColors();

  return (
    <ChartProvider
      mode="system"
      palette={CHART_PALETTE}
      tokens={{
        background: colors.background,
        foreground: colors.foreground,
        card: colors.card,
        muted: colors.tile,
        mutedForeground: colors.muted,
        border: colors.border,
        popover: colors.card,
        popoverForeground: colors.foreground,
        primary: colors.primary,
        primaryForeground: colors.primaryForeground,
        positive: colors.accent,
        negative: colors.danger,
      }}
    >
      {children}
    </ChartProvider>
  );
}
