import { Text, View } from "react-native";

type Props = {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
};

function deltaLabel(delta: number, suffix: string) {
  const arrow = delta >= 0 ? "↑" : "↓";
  return `${arrow} ${Math.round(Math.abs(delta))}${suffix}`;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaSuffix = "%",
}: Props) {
  const deltaClass =
    delta === undefined || delta === 0
      ? "text-muted"
      : delta > 0
        ? "text-accent"
        : "text-warm";

  return (
    <View className="flex-1 rounded-[16px] bg-card px-[11px] pb-2 pt-3">
      <Text className="text-[10px] text-soft">{label}</Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-[14px] font-semibold text-hero-foreground"
      >
        {value}
      </Text>

      <Text className={`pt-1.5 text-[10px] ${deltaClass}`}>
        {delta === undefined ? "—" : deltaLabel(delta, deltaSuffix)}
      </Text>
    </View>
  );
}
