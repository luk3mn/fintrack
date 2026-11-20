import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Summary } from "@/lib/summary";

type Props = {
  summary: Summary;
};

export function AccountsHero({ summary }: Props) {
  return (
    <View className="min-h-[140px] rounded-[20px] bg-hero px-[18px] pb-4 pt-5">
      <Text className="text-[10px] uppercase tracking-[1px] text-soft">
        Total em contas
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-[29px] font-semibold leading-[35px] text-hero-foreground"
      >
        {formatBRL(summary.cash)}
      </Text>

      <Text className="pt-3 text-xs text-soft">
        Faturas abertas  − {formatBRL(Math.abs(summary.cardBills))}
      </Text>
    </View>
  );
}
