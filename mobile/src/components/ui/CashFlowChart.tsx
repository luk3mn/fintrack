import { Ionicons } from "@expo/vector-icons";
import { ComboChart, ChartProvider, type ChartConfig } from "expo-charts";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { formatBRLShort, formatNetBRL } from "@/lib/money";
import type { CashFlowPoint } from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  data: CashFlowPoint[];
  /** Slice selected by default, or -1 to pick the first one with data. */
  initialSelected?: number;
  /** When present, the card is a preview that opens the given screen. */
  onPress?: () => void;
  /** Chart caption, e.g. `semana`, `dia` or `mês`. */
  granularity?: string;
};

const CHART_HEIGHT = 150;

const hasData = (point: CashFlowPoint) =>
  point.income > 0 || point.expenses > 0;

function defaultSelection(data: CashFlowPoint[], preferred: number) {
  if (preferred >= 0 && data[preferred] && hasData(data[preferred])) {
    return preferred;
  }
  const firstWithData = data.findIndex(hasData);
  if (firstWithData >= 0) return firstWithData;
  return preferred >= 0 ? preferred : data.length - 1;
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-2">
        <View
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <Text className="text-xs text-muted">{label}</Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        className="pt-1 text-sm font-semibold text-foreground"
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Real cash flow as a combo chart: entries and debits as bars, with the net
 * balance (entries minus debits) as the line. When `onPress` is supplied the
 * card becomes a compact preview that opens the full report.
 */
export function CashFlowChart({
  data,
  initialSelected = -1,
  onPress,
  granularity = "período",
}: Props) {
  const colors = useThemeColors();

  const dataKey = `${initialSelected}:${data
    .map(
      (point) =>
        `${point.label}-${point.rangeLabel}-${point.income}-${point.expenses}`,
    )
    .join("|")}`;
  const [selection, setSelection] = useState(() => ({
    key: dataKey,
    index: defaultSelection(data, initialSelected),
  }));

  // Reset the selected slice when the period or its real values change.
  if (selection.key !== dataKey) {
    setSelection({
      key: dataKey,
      index: defaultSelection(data, initialSelected),
    });
  }

  const selected =
    selection.key === dataKey
      ? selection.index
      : defaultSelection(data, initialSelected);
  const selectedPoint = data[selected] ?? data[data.length - 1];
  const net = selectedPoint.income - selectedPoint.expenses;

  const rows = data.map((point) => ({
    label: point.label,
    income: point.income,
    expenses: point.expenses,
    // The line is the real net balance of the same slice, not a made-up metric.
    balance: point.income - point.expenses,
  }));

  const config: ChartConfig = {
    income: { label: "Entradas", color: colors.primary },
    expenses: { label: "Saídas", color: colors.warm },
    balance: { label: "Saldo", color: colors.foreground },
  };
  const types: Record<string, "bar" | "line" | "area"> = {
    income: "bar",
    expenses: "bar",
    balance: "line",
  };

  const chart = (
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
      <ComboChart
        data={rows}
        config={config}
        keys={["income", "expenses", "balance"]}
        xKey="label"
        types={types}
        height={CHART_HEIGHT}
        radius={5}
        curve="monotone"
        strokeWidth={2}
        showDots
        showGrid
        gridStyle="dashed"
        showYAxis={false}
        showLegend
        legendMode="none"
        legendPosition="top"
        showTooltip={!onPress}
        activeIndex={selected}
        formatValue={formatBRLShort}
        accessibilityLabel={`Entradas, saídas e saldo por ${granularity}.`}
        onSelect={(index) => {
          if (index === null) return;
          if (onPress) {
            onPress();
            return;
          }
          setSelection({ key: dataKey, index });
        }}
        style={{ width: "100%" }}
      />
    </ChartProvider>
  );

  const content = (
    <View className="rounded-3xl bg-card px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted">
          Entradas, saídas e saldo por {granularity}
        </Text>
        {onPress ? (
          <Ionicons
            name="arrow-up-right-box-outline"
            size={20}
            color={colors.muted}
          />
        ) : null}
      </View>

      <View className="pt-2">{chart}</View>

      <View className="mt-3 flex-row items-center gap-3 rounded-2xl bg-tile px-3 py-2">
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-xs font-semibold text-foreground"
          >
            {selectedPoint.rangeLabel}
          </Text>
          <Text numberOfLines={1} className="pt-0.5 text-xs text-muted">
            {hasData(selectedPoint)
              ? `Saldo ${formatNetBRL(net)}`
              : "Sem movimentação"}
          </Text>
        </View>
        <MiniStat
          label="Entradas"
          value={formatBRLShort(selectedPoint.income)}
          color={colors.primary}
        />
        <MiniStat
          label="Saídas"
          value={formatBRLShort(selectedPoint.expenses)}
          color={colors.warm}
        />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Ver fluxo do mês"
        accessibilityHint="Abre a tela de gastos"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        className="rounded-3xl"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
