import { Text, View } from "react-native";
import { formatBRLCompact } from "@/lib/money";
import type { TransactionTotals } from "@/lib/transactions";
import type { TransactionColors } from "../theme";

type Props = {
  summary: TransactionTotals;
  colors: TransactionColors;
};

export function TransactionSummary({ summary, colors }: Props) {
  const items = [
    { label: "ENTRADAS", value: summary.income },
    { label: "SAÍDAS", value: summary.expenses },
    { label: "SALDO", value: summary.balance },
  ];

  return (
    <View
      className="flex-row rounded-2xl px-4 py-4"
      style={{ backgroundColor: colors.card }}
    >
      {items.map((item, index) => (
        <View key={item.label} className="flex-1">
          <Text
            className="text-xs font-medium tracking-wide"
            style={{ color: colors.muted }}
          >
            {item.label}
          </Text>
          <Text
            className={`pt-2 text-base font-semibold ${
              index === 0 ? "pr-1" : "pl-1"
            }`}
            style={{ color: colors.figure }}
            numberOfLines={1}
          >
            {formatBRLCompact(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}
