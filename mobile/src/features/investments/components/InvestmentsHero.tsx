import { Pressable, Text, View } from "react-native";
import { formatBRL, formatSignedBRL } from "@/lib/money";
import type { InvestmentSummary } from "@/lib/investments";

type Props = {
  summary: InvestmentSummary;
  onPress: () => void;
};

export function InvestmentsHero({ summary, onPress }: Props) {
  const hasProfit = summary.profit !== 0;
  const profitLabel = hasProfit ? formatSignedBRL(summary.profit) : "—";
  const arrow = summary.profit >= 0 ? "↗" : "↘";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ver patrimônio investido por instituição"
      accessibilityHint="Abre o detalhamento por banco"
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      className="min-h-36 rounded-3xl bg-hero px-4 pb-4 pt-5"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs uppercase tracking-wider text-soft">
          Patrimônio investido
        </Text>
        <Text className="text-xs text-soft">por banco ›</Text>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-3xl font-semibold leading-9 text-hero-foreground"
      >
        {formatBRL(summary.total)}
      </Text>

      <Text
        className={`pt-3 text-xs font-medium ${
          hasProfit && summary.profit < 0 ? "text-warm" : "text-accent"
        }`}
      >
        Rendimento total {profitLabel}
        {hasProfit ? ` ${arrow}` : ""}
      </Text>
    </Pressable>
  );
}
