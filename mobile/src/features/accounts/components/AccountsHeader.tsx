import { Text, View } from "react-native";
import { relativeSyncLabel } from "@/lib/dates";

type Props = {
  lastSync?: Date;
  loading?: boolean;
};

export function AccountsHeader({ lastSync, loading = false }: Props) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      <View>
        <Text className="text-2xl font-semibold text-foreground">Contas</Text>
      </View>

      <View className="h-10 w-32 flex-row items-center justify-center rounded-lg bg-card">
        <Text className="text-xs text-soft">
          {loading ? "Sincronizando…" : relativeSyncLabel(lastSync)}
        </Text>
      </View>
    </View>
  );
}
