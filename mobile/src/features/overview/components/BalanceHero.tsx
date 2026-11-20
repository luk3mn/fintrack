import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Summary } from "@/lib/summary";

type Props = {
  summary: Summary;
};

export function BalanceHero({ summary }: Props) {
  return (
    <View className="rounded-[20px] bg-hero px-[18px] pb-4 pt-5">
      <Text className="text-[10px] font-medium uppercase tracking-[1px] text-soft">
        Saldo em contas
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-[31px] font-semibold leading-[38px] text-hero-foreground"
      >
        {formatBRL(summary.cash)}
      </Text>

      <View className="gap-1 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] text-soft">Faturas de cartão</Text>
          <Text className="text-[11px] text-soft">
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
