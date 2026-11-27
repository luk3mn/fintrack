import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type {
  SpendingGrouping,
  SpendingRow as SpendingRowData,
} from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  row: SpendingRowData;
  grouping: SpendingGrouping;
  max: number;
  onPress?: () => void;
};

const BAR_MAX_WIDTH = 120;

export function SpendingRow({ row, grouping, max, onPress }: Props) {
  const colors = useThemeColors();
  const width =
    max > 0 ? Math.max(4, Math.round((row.total / max) * BAR_MAX_WIDTH)) : 4;
  const details =
    grouping === "category" || !row.category || row.category === row.name
      ? `${row.count} ${row.count === 1 ? "gasto" : "gastos"}`
      : `${row.count} ${row.count === 1 ? "gasto" : "gastos"} · ${row.category}`;

  const content = (
    <View className="flex-row items-center gap-3">
      <View
        className="size-10 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.tile }}
      >
        <Ionicons
          name={grouping === "category" ? "grid-outline" : "storefront-outline"}
          size={18}
          color={colors.accent}
        />
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className="min-w-0 flex-1 text-sm font-medium text-foreground"
          >
            {row.name}
          </Text>
          <Text className="shrink-0 text-sm font-semibold text-foreground">
            {formatBRL(row.total)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between gap-2 pt-1">
          <View className="min-w-0 flex-1 flex-row items-center gap-1">
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-xs text-muted"
            >
              {details}
            </Text>
            {row.customCategory ? (
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={colors.accent}
              />
            ) : null}
          </View>
          <Text className="shrink-0 text-xs text-muted">
            {Math.round(row.share * 100)}%
          </Text>
        </View>

        <View
          className="mt-2 h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: colors.card }}
        >
          <View
            style={{
              width,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.accent,
            }}
          />
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Definir categoria de ${row.name}`}
      className="active:opacity-70"
    >
      {content}
    </Pressable>
  );
}
