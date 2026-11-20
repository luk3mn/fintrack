import { Text, View } from "react-native";

export function BudgetSection() {
  return (
    <View className="flex-row items-center rounded-2xl bg-card px-4 py-4">
      <View className="flex-1 pr-3">
        <Text className="text-xs text-soft">Nenhum orçamento definido</Text>
        <Text className="pt-1 text-xs text-subtle">
          Limites por categoria estarão disponíveis em breve.
        </Text>
      </View>

      <View className="rounded-full border border-border px-2 py-1">
        <Text className="text-xs font-medium uppercase tracking-wide text-subtle">
          Em breve
        </Text>
      </View>
    </View>
  );
}
