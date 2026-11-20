import { Text, View } from "react-native";
import { formatBRLCompact } from "@/lib/money";
import { useThemeColors } from "@/theme/tokens";
import type { CategoryTotal } from "../hooks/useOverview";

type Props = {
  categories: CategoryTotal[];
};

const BAR_MAX_WIDTH = 130;

export function CategoryBreakdown({ categories }: Props) {
  const colors = useThemeColors();

  if (categories.length === 0) {
    return (
      <View className="rounded-2xl bg-card px-4 py-5">
        <Text className="text-xs text-subtle">
          Sem gastos categorizados neste mês.
        </Text>
      </View>
    );
  }

  const top = categories[0]?.amount ?? 0;

  return (
    <View className="gap-5 px-1">
      {categories.map((category, index) => {
        const width =
          top > 0
            ? Math.max(6, Math.round((category.amount / top) * BAR_MAX_WIDTH))
            : 6;

        return (
          <View key={category.name} className="flex-row items-center">
            <Text
              numberOfLines={1}
              className="w-22 text-xs text-soft"
            >
              {category.name}
            </Text>

            <View className="ml-1.5 w-32">
              <View
                style={{
                  width,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    index === 0 ? colors.warm : colors.accent,
                }}
              />
            </View>

            <Text className="flex-1 pl-6 text-xs font-medium text-hero-foreground">
              {formatBRLCompact(category.amount)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
