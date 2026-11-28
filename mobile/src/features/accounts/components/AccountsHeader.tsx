import { Text, View } from "react-native";
import { SyncStatus } from "@/components/ui/SyncStatus";

type Props = {
  lastSync?: Date;
  loading?: boolean;
};

export function AccountsHeader({ lastSync, loading = false }: Props) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      <View className="px-1">
        <Text className="text-2xl font-semibold text-foreground">Contas</Text>
      </View>

      <View className="mt-1 flex-row justify-end px-1">
        <SyncStatus lastSync={lastSync} loading={loading} />
      </View>
    </View>
  );
}
