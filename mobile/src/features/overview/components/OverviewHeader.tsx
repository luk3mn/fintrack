import { Text, View } from "react-native";
import { relativeSyncLabel } from "@/lib/dates";

type Props = {
  lastSync?: Date;
};

export function OverviewHeader({ lastSync }: Props) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      <View className="px-1">
        <Text className="text-2xl font-semibold text-foreground">
          Visão geral
        </Text>
      </View>

      <View className="mt-1 flex-row justify-end">
        <View className="mr-1 h-6 flex-row items-center rounded-xl bg-card px-3">
          <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-warm" />
          <Text className="text-xs text-soft">{relativeSyncLabel(lastSync)}</Text>
        </View>
      </View>
    </View>
  );
}
