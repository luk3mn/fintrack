import { Text, View } from "react-native";
import { relativeSyncLabel } from "@/lib/dates";
import type { TransactionColors } from "../theme";

type Props = {
  lastSync?: Date;
  loading?: boolean;
  colors: TransactionColors;
};

export function TransactionsHeader({
  lastSync,
  loading = false,
  colors,
}: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <Text
        className="text-2xl font-semibold"
        style={{ color: colors.foreground }}
      >
        Transações
      </Text>

      <Text
        className="pt-1 text-right text-xs"
        style={{ color: colors.muted }}
      >
        {loading ? "Sincronizando…" : relativeSyncLabel(lastSync)}
      </Text>
    </View>
  );
}
