import { Pressable, Text, View } from "react-native";
import type { InvestmentFilter } from "@/lib/investments";

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
  return (
    <View className="flex-row flex-wrap gap-2 pt-3">
      {FILTERS.map((filter) => {
        const active = filter.key === value;

        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter.key)}
            className={`rounded-lg px-3 py-1 ${
              active ? "bg-accent" : "bg-card"
            }`}
          >
            <Text
              className={`text-[10px] ${
                active ? "font-medium text-primary-foreground" : "text-soft"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
