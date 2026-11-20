import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Summary } from "@/lib/summary";

type Props = {
  summary: Summary;
};

export function BalanceHero({ summary }: Props) {
  return (
    <View className="rounded-3xl bg-hero px-4 pb-4 pt-5">
      <Text className="text-xs font-medium uppercase tracking-wider text-soft">
        Saldo em contas
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-3xl font-semibold leading-10 text-hero-foreground"
      >
        {formatBRL(summary.cash)}
      </Text>

      <View className="gap-1 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-soft">Faturas de cartão</Text>
          <Text className="text-xs text-soft">
            − {formatBRL(Math.abs(summary.cardBills))}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-hero-foreground">
            Saldo após faturas
          </Text>
          <Text className="text-xs font-medium text-hero-foreground">
            {formatBRL(summary.available)}
          </Text>
        </View>
      </View>
    </View>
  );
}
