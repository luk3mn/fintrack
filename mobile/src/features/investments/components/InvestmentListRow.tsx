import { Text, View } from "react-native";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import {
  CATEGORY_LABELS,
  investmentCategory,
  shortInstitutionName,
} from "@/lib/investments";
import { formatBRL, formatSignedBRL } from "@/lib/money";
import type { Investment } from "@/types/domain";

type Props = {
  investment: Investment;
};

export function InvestmentListRow({ investment }: Props) {
  const subtitle = shortInstitutionName(
    investment.institution ??
      investment.issuer ??
      CATEGORY_LABELS[investmentCategory(investment)],
  );

  const showProfit = investment.profit != null && investment.profit !== 0;
  const value = showProfit
    ? formatSignedBRL(investment.profit as number)
    : formatBRL(investment.balance);

  return (
    <View className="flex-row items-center gap-3 pb-4 pt-2.5">
      <InstitutionLogo
        institution={investment.institution ?? investment.issuer}
        name={subtitle}
        size={28}
      />

      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-3">
          <Text
            numberOfLines={1}
            className="flex-1 text-xs font-medium leading-4 text-foreground"
          >
            {investment.name}
          </Text>

          <Text
            className={`text-xs font-medium leading-4 ${
              showProfit ? "text-accent" : "text-foreground"
            }`}
          >
            {value}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          className="pt-1 text-xs leading-3 text-soft"
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
