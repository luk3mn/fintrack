import { Pressable, Text, View } from "react-native";
import {
  chartTextColor,
  useChartPalette,
} from "@/components/ui/ChartThemeProvider";
import {
  INVESTMENT_FLOW_ORDER,
  type InvestmentFilter,
  type InvestmentFlowCategory,
} from "@/lib/investments";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  value: InvestmentFilter;
  onChange: (filter: InvestmentFilter) => void;
};

const FILTERS: { key: InvestmentFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "fixed", label: "Renda fixa" },
  { key: "funds", label: "Fundos" },
  { key: "equity", label: "Ações" },
];

export function FilterTabs({ value, onChange }: Props) {
  const colors = useThemeColors();
  const palette = useChartPalette();

  return (
    <View className="flex-row flex-wrap gap-2 pt-3">
      {FILTERS.map((filter) => {
        const active = filter.key === value;
        const seriesColor =
          palette[
            INVESTMENT_FLOW_ORDER.indexOf(filter.key as InvestmentFlowCategory)
          ] ?? colors.primary;
        const backgroundColor =
          filter.key === "all" ? colors.primary : seriesColor;
        const textColor =
          filter.key === "all"
            ? colors.primaryForeground
            : chartTextColor(seriesColor);

        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter.key)}
            className={`rounded-lg px-3 py-1 ${active ? "" : "bg-card"}`}
            style={active ? { backgroundColor } : undefined}
          >
            <Text
              className={`text-xs ${active ? "font-medium" : "text-soft"}`}
              style={active ? { color: textColor } : undefined}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
