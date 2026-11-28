import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Summary } from "@/lib/summary";

type Props = {
  summary: Summary;
};

export function AccountsHero({ summary }: Props) {
  return (
    <View className="min-h-35 rounded-3xl bg-card px-4 pb-4 pt-5">
      <Text className="text-xs uppercase tracking-wider text-muted">
        Total em contas
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-3xl font-semibold leading-9 text-foreground"
      >
        {formatBRL(summary.cash)}
      </Text>

      <Text className="pt-3 text-xs text-warm">
        Faturas abertas − {formatBRL(Math.abs(summary.cardBills))}
      </Text>
    </View>
  );
}
