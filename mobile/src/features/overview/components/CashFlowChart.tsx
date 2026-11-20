import { Text, View } from "react-native";
import { useThemeColors } from "@/theme/tokens";
import type { Cents } from "@/types/domain";

type Props = {
  data: Cents[];
  highlight: number;
  startLabel: string;
  middleLabel: string;
  endLabel: string;
};

const BAR_WIDTH = 19;
const BAR_MAX_HEIGHT = 57;

export function CashFlowChart({
  data,
  highlight,
  startLabel,
  middleLabel,
  endLabel,
}: Props) {
  const colors = useThemeColors();
  const max = Math.max(...data, 0);

  if (max === 0) {
    return (
      <View
        className="items-center justify-center rounded-[16px] bg-card"
        style={{ height: 101 }}
      >
        <Text className="text-[11px] text-subtle">
          Sem gastos neste mês.
        </Text>
      </View>
    );
  }

  const heightOf = (value: Cents) =>
    value <= 0
      ? 6
      : Math.round(10 + (value / max) * BAR_MAX_HEIGHT);

  return (
    <View
      className="rounded-[16px] bg-card px-4 pb-1 pt-2"
      style={{ height: 101 }}
    >
      <View className="flex-1 flex-row items-end justify-between">
        {data.map((value, index) => (
          <View
            key={index}
            style={{
              width: BAR_WIDTH,
              height: heightOf(value),
              borderRadius: 7,
              backgroundColor:
                index === highlight ? colors.warm : colors.accent,
            }}
          />
        ))}
      </View>

      <View className="flex-row items-center justify-between pt-1">
        <Text className="text-[9px] text-subtle">{startLabel}</Text>
        <Text className="text-[9px] text-subtle">{middleLabel}</Text>
        <Text className="text-[9px] text-subtle">{endLabel}</Text>
      </View>
    </View>
  );
}
