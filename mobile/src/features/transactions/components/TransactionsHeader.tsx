import { Text, View } from "react-native";
import { SyncStatus } from "@/components/ui/SyncStatus";
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
    <View className="flex-row items-center justify-between pt-2">
      <View className="px-1">
        <Text
          className="text-2xl font-semibold"
          style={{ color: colors.foreground }}
        >
          Transações
        </Text>
      </View>

      <View className="mt-1 flex-row justify-end px-1">
        <SyncStatus
          lastSync={lastSync}
          loading={loading}
          color={colors.muted}
        />
      </View>
    </View>
  );
}
