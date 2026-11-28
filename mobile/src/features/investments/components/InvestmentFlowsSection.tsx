import { ChartProvider, LineSeriesChart, type ChartConfig } from "expo-charts";
import { useState } from "react";
import { Text, View } from "react-native";
import { ChartTapToggle } from "@/components/ui/ChartTapToggle";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  INVESTMENT_FLOW_LABELS,
  type InvestmentFlowCategory,
} from "@/lib/investments";
import { formatBRL, formatBRLShort } from "@/lib/money";
import { useThemeColors } from "@/theme/tokens";
import type { InvestmentFlowPoint } from "../hooks/useInvestmentFlows";

type Props = {
  flows: InvestmentFlowPoint[];
  keys: InvestmentFlowCategory[];
  isLoading?: boolean;
};

const CHART_HEIGHT = 150;

/** Accumulated applications by type, in the old allocation section's place. */
export function InvestmentFlowsSection({ flows, keys, isLoading }: Props) {
  const colors = useThemeColors();
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  if (tooltipIndex !== null && tooltipIndex >= flows.length) {
    setTooltipIndex(null);
  }

  const config: ChartConfig = Object.fromEntries(
    keys.map((key) => [
      key,
      { label: INVESTMENT_FLOW_LABELS[key], color: colors.chartSeries[key] },
    ]),
  );
  const rows = flows.map((point) => ({ ...point }));
  const last = flows[flows.length - 1];
  const periodLabel =
    flows.length > 0
      ? `Somente aplicações · ${flows[0].label} – ${last.label} ${last.fullLabel.slice(-4)}`
      : "";

  return (
    <View className="pt-6">
      <SectionTitle title="Aplicações por tipo" />

      <View className="mt-3 rounded-3xl bg-card px-4 py-3">
        {keys.length > 0 ? (
          <>
            <ChartTapToggle
              count={rows.length}
              edge={7.5}
              activeIndex={tooltipIndex}
              onIndexChange={setTooltipIndex}
            >
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
                <LineSeriesChart
                  data={rows}
                  config={config}
                  keys={keys}
                  xKey="label"
                  height={CHART_HEIGHT}
                  curve="monotone"
                  strokeWidth={2}
                  glow
                  showDots
                  bufferLast
                  showGrid
                  gridStyle="dashed"
                  showYAxis={false}
                  showTooltip
                  activeIndex={tooltipIndex}
                  formatValue={formatBRLShort}
                  isLoading={isLoading}
                  accessibilityLabel={`Aplicações acumuladas por tipo: ${keys
                    .map(
                      (key) =>
                        `${INVESTMENT_FLOW_LABELS[key]}, ${formatBRL(last?.[key] ?? 0)}`,
                    )
                    .join("; ")}`}
                  style={{ width: "100%" }}
                />
              </ChartProvider>
            </ChartTapToggle>

            <View className="flex-row flex-wrap gap-3 pt-3">
              {keys.map((key) => (
                <View key={key} className="flex-row items-center gap-1.5">
                  <View
                    className="size-2 rounded-full"
                    style={{ backgroundColor: colors.chartSeries[key] }}
                  />
                  <Text className="text-xs text-muted">
                    {INVESTMENT_FLOW_LABELS[key]}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="pt-2 text-xs text-subtle">{periodLabel}</Text>
          </>
        ) : (
          <Text className="py-6 text-center text-xs text-muted">
            Sem aplicações registradas neste ano.
          </Text>
        )}
      </View>
    </View>
  );
}
