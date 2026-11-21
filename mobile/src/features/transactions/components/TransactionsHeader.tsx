import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { relativeSyncLabel } from "@/lib/dates";
import type { TransactionColors } from "../theme";

type Props = {
  lastSync?: Date;
  loading?: boolean;
  onRefresh: () => void;
  colors: TransactionColors;
};

export function TransactionsHeader({
  lastSync,
  loading = false,
  onRefresh,
  colors,
}: Props) {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text
          className="text-2xl font-semibold"
          style={{ color: colors.foreground }}
        >
          Transações
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sincronizar transações"
          onPress={onRefresh}
          className="h-8 w-8 items-center justify-center active:opacity-60"
        >
          <Ionicons name="refresh-outline" size={19} color={colors.muted} />
        </Pressable>
      </View>

      <Text
        className="pt-1 text-right text-xs"
        style={{ color: colors.muted }}
      >
        {loading ? "Sincronizando…" : relativeSyncLabel(lastSync)}
      </Text>
    </View>
  );
}
