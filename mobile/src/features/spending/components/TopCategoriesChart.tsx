import { ChartProvider, SegmentedBar } from "expo-charts";
import { Text, View } from "react-native";
import { formatBRLShort } from "@/lib/money";
import type { SpendingRow } from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  rows: SpendingRow[];
  /** Total gasto real do período, usado como capacidade da barra. */
  total: number;
  selected?: string | null;
  onSelect: (category: string | null) => void;
  /** Keep the chart compact; only the biggest categories are drawn. */
  limit?: number;
};

/** Compact comparison of the largest real expense categories in the period. */
export function TopCategoriesChart({
  rows,
  total,
  selected = null,
  onSelect,
  limit = 5,
}: Props) {
  const colors = useThemeColors();
  const top = rows.slice(0, limit);

  if (top.length === 0) {
    return (
      <View className="rounded-3xl bg-card px-4 py-5">
        <Text className="text-center text-xs text-muted">
          Nenhum gasto neste período.
        </Text>
      </View>
    );
  }

  const data = top.map((row) => ({
    label: row.name,
    value: row.total,
  }));
  const selectedIndex = selected
    ? data.findIndex((item) => item.label === selected)
    : -1;

  return (
    <View className="rounded-3xl bg-card px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted">Comparativo por categoria</Text>
        <Text className="text-xs text-subtle">
          {top.length === 1 ? "1 categoria" : `${top.length} maiores`}
        </Text>
      </View>

      <View className="pt-3">
        <ChartProvider
          mode="system"
          tokens={{
            background: colors.background,
            foreground: colors.foreground,
            card: colors.card,
            muted: colors.tile,
            mutedForeground: colors.muted,
            border: colors.border,
            popover: colors.card,
            popoverForeground: colors.foreground,
            primary: colors.primary,
            primaryForeground: colors.primaryForeground,
            positive: colors.accent,
            negative: colors.danger,
          }}
        >
          <SegmentedBar
            data={data}
            total={total}
            remainingLabel="Outros"
            height={16}
            gap={3}
            roundSegments
            trackColor={colors.tile}
            showLegend
            legendValue="both"
            formatValue={formatBRLShort}
            selectedIndex={selectedIndex >= 0 ? selectedIndex : null}
            accessibilityLabel={`Maiores gastos por categoria: ${data
              .map((item) => `${item.label}, ${formatBRLShort(item.value)}`)
              .join("; ")}`}
            onSelect={(index, datum) => {
              onSelect(index === null || !datum ? null : datum.label);
            }}
            style={{ width: "100%" }}
          />
        </ChartProvider>
      </View>
    </View>
  );
}
