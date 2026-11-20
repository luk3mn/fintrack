import { Text, View } from "react-native";
import { formatBRL, formatSignedBRL } from "@/lib/money";
import type { InvestmentSummary } from "@/lib/investments";

type Props = {
  summary: InvestmentSummary;
};

export function InvestmentsHero({ summary }: Props) {
  const hasProfit = summary.profit !== 0;
  const profitLabel = hasProfit ? formatSignedBRL(summary.profit) : "—";
  const arrow = summary.profit >= 0 ? "↗" : "↘";

  return (
    <View className="min-h-[142px] rounded-[20px] bg-hero px-[18px] pb-4 pt-5">
      <Text className="text-[10px] uppercase tracking-[1px] text-soft">
        Patrimônio investido
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-[29px] font-semibold leading-[35px] text-hero-foreground"
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
    </View>
  );
}
