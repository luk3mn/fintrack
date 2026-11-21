import { useColorScheme } from "react-native";
import { palettes } from "@/theme/tokens";

function makePalette(dark: boolean) {
  return {
    background: dark ? palettes.spaceIndigo[950] : "#ffffff",
    card: dark ? palettes.spaceIndigo[900] : palettes.dustyGrape[50],
    border: dark ? palettes.spaceIndigo[800] : palettes.parchment[100],
    foreground: dark ? palettes.dustyGrape[50] : palettes.parchment[900],
    muted: dark ? palettes.dustyGrape[300] : palettes.parchment[700],
    subtle: dark ? palettes.dustyGrape[500] : palettes.parchment[600],
    accent: dark ? palettes.spaceIndigo[300] : palettes.spaceIndigo[600],
    accentForeground: dark ? palettes.spaceIndigo[950] : "#ffffff",
    figure: dark ? palettes.spaceIndigo[300] : palettes.spaceIndigo[700],
    warm: dark ? palettes.parchment[400] : palettes.parchment[600],
    tile: dark ? palettes.spaceIndigo[700] : palettes.spaceIndigo[200],
  };
}

export const transactionPalettes = {
  light: makePalette(false),
  dark: makePalette(true),
} as const;

export type TransactionColors = (typeof transactionPalettes)[keyof typeof transactionPalettes];

export function useTransactionColors(): TransactionColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? transactionPalettes.dark : transactionPalettes.light;
}
