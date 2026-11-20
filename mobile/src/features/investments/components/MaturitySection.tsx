import { Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  shortInvestmentName,
  type InvestmentSummary,
} from "@/lib/investments";
import { formatBRL } from "@/lib/money";

type Props = {
  summary: InvestmentSummary;
};

export function MaturitySection({ summary }: Props) {
  const maturities = summary.maturities.slice(0, 2);

  return (
    <View className="pt-6">
      <SectionTitle title="Próximos vencimentos" />

      {maturities.length === 0 ? (
        <Text className="pt-3 text-xs text-soft">
          Nenhum vencimento informado.
        </Text>
      ) : (
        <View className="flex-row gap-3 pt-3">
          {maturities.map((maturity) => (
            <View
              key={maturity.id}
              className="min-h-[52px] flex-1 rounded-[14px] bg-card px-4 py-2"
            >
              <Text
                numberOfLines={1}
                className="text-[9px] leading-[12px] text-soft"
              >
                {maturity.dateLabel} · {shortInvestmentName(maturity.name)}
              </Text>
              <Text className="pt-1 text-xs font-medium leading-[15px] text-foreground">
                {formatBRL(maturity.balance)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
