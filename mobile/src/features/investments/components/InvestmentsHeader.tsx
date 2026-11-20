import { Text, View } from "react-native";
import { relativeSyncLabel } from "@/lib/dates";

type Props = {
  lastSync?: Date;
  loading?: boolean;
};

export function InvestmentsHeader({ lastSync, loading = false }: Props) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      <Text className="text-2xl font-semibold text-foreground">
        Investimentos
      </Text>

      <View className="h-[25px] w-[126px] items-center justify-center rounded-xl bg-card">
        <Text className="text-[10px] text-soft">
          {loading ? "Sincronizando…" : relativeSyncLabel(lastSync)}
        </Text>
      </View>
    </View>
  );
}
