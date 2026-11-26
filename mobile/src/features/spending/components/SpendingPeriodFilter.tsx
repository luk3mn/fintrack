import { Pressable, Text, View } from "react-native";
import { SPENDING_PERIODS, type SpendingPeriod } from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  value: SpendingPeriod;
  onChange: (period: SpendingPeriod) => void;
};

export function SpendingPeriodFilter({ value, onChange }: Props) {
  const colors = useThemeColors();

  return (
    <View
      className="flex-row gap-1 rounded-2xl p-1"
      style={{ backgroundColor: colors.card }}
    >
      {SPENDING_PERIODS.map((option) => {
        const selected = option.key === value;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.key)}
            className="flex-1 rounded-xl py-2.5 active:opacity-70"
            style={{
              backgroundColor: selected ? colors.accent : "transparent",
            }}
          >
            <Text
              className={`text-center text-xs font-medium ${
                selected ? "" : "text-muted"
              }`}
              style={selected ? { color: colors.primaryForeground } : undefined}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
