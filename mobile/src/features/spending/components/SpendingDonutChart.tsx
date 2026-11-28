import { PieSeriesChart } from "expo-charts";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ChartThemeProvider } from "@/components/ui/ChartThemeProvider";
import { formatBRLShort } from "@/lib/money";
import type { SpendingRow } from "@/lib/spending";

type Props = {
  rows: SpendingRow[];
  /** Real total spent in the period, shown in the donut centre. */
  total: number;
  selected?: string | null;
  onSelect: (category: string | null) => void;
  limit?: number;
};

const OTHER = "Outros";

/** Real category composition of the period as a donut chart. */
export function SpendingDonutChart({
  rows,
  total,
  selected = null,
  onSelect,
  limit = 5,
}: Props) {
  const positive = rows.filter((row) => row.total > 0);
  const top = positive.slice(0, limit);
  const rest = positive.slice(limit).reduce((sum, row) => sum + row.total, 0);
  // expo-charts toggles the active slice off on a second tap. Remounting with
  // the same activeIndex keeps the highlight stable while the filter sheet
  // remains the way to clear the selection.
  const [selectionKey, setSelectionKey] = useState(0);

  const data = top.map((row) => ({
    name: row.name,
    value: row.total,
  }));
  if (rest > 0) data.push({ name: OTHER, value: rest });

  if (data.length === 0) {
    return (
      <View className="rounded-3xl bg-card px-4 py-5">
        <Text className="text-center text-xs text-muted">
          Nenhum gasto neste período.
        </Text>
      </View>
    );
  }

  const selectedIndex = selected
    ? data.findIndex((item) => item.name === selected)
    : -1;
  const activeIndex = selectedIndex >= 0 ? selectedIndex : null;

  return (
    <View className="rounded-3xl bg-card px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted">Composição por categoria</Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-xs text-subtle">
            {data.length === 1 ? "1 categoria" : `${data.length} categorias`}
          </Text>
          {selected ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar categoria selecionada"
              onPress={() => onSelect(null)}
              className="active:opacity-70"
            >
              <Text className="text-xs text-accent">Limpar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ChartThemeProvider>
        <PieSeriesChart
          key={selectionKey}
          data={data}
          nameKey="name"
          valueKey="value"
          size={220}
          innerRadius={0.62}
          showTooltip
          showLegend
          legendVariant="circle"
          formatValue={formatBRLShort}
          centerValue={formatBRLShort(total)}
          centerLabel="Total"
          activeIndex={activeIndex}
          accessibilityLabel={`Gastos por categoria: ${data
            .map((item) => `${item.name}, ${formatBRLShort(item.value)}`)
            .join("; ")}`}
          onSelect={(index, datum) => {
            if (index === null) {
              if (activeIndex !== null) setSelectionKey((key) => key + 1);
              return;
            }
            const name = datum?.name ?? null;
            // The aggregated slice is not a real category filter.
            onSelect(name && name !== OTHER ? name : null);
          }}
          style={{ width: "100%" }}
        />
      </ChartThemeProvider>
    </View>
  );
}
