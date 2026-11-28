import { Pressable, Text, View } from "react-native";
import type { InvestmentFilter } from "@/lib/investments";
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

  return (
    <View className="flex-row flex-wrap gap-2 pt-3">
      {FILTERS.map((filter) => {
        const active = filter.key === value;
        const backgroundColor =
          filter.key === "all"
            ? colors.primary
            : colors.chartSeries[filter.key];
        const textColor =
          filter.key === "all"
            ? colors.primaryForeground
            : colors.chartSeriesOn;

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
