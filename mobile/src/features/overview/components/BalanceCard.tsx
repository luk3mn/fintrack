import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Summary } from "../hooks/useOverview";

type Props = {
  summary: Summary;
};

type LineProps = {
  label: string;
  value: string;
  negative?: boolean;
};

function Line({ label, value, negative = false }: LineProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-zinc-400">{label}</Text>
      <Text
        className={`text-sm font-semibold ${negative ? "text-red-400" : "text-zinc-100"}`}
      >
        {value}
      </Text>
    </View>
  );
}

export function BalanceCard({ summary }: Props) {
  return (
    <View className="gap-4 rounded-2xl bg-zinc-900 p-5">
      <View className="gap-1">
        <Text className="text-sm text-zinc-400">Saldo em contas</Text>
        <Text className="text-4xl font-bold text-zinc-50">
          {formatBRL(summary.cash)}
        </Text>
      </View>

      <View className="gap-2 border-t border-zinc-800 pt-4">
        <Line
          label="Faturas de cartão"
          value={formatBRL(-summary.cardBills)}
          negative
        />
        <Line label="Saldo após faturas" value={formatBRL(summary.available)} />
      </View>
    </View>
  );
}
