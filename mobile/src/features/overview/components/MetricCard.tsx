import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  onPress?: () => void;
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
  onPress,
}: Props) {
  const colors = useThemeColors();
  const deltaClass =
    delta === undefined || delta === 0
      ? "text-muted"
      : delta > 0
        ? "text-accent"
        : "text-warm";

  const content = (
    <>
      <View className="flex-row items-center gap-1">
        <Text numberOfLines={1} className="text-xs text-soft">
          {label}
        </Text>
        {onPress ? (
          <Ionicons name="chevron-forward" size={12} color={colors.soft} />
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-sm font-semibold text-hero-foreground"
      >
        {value}
      </Text>

      <Text className={`pt-1.5 text-xs ${deltaClass}`}>
        {delta === undefined ? "—" : deltaLabel(delta, deltaSuffix)}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View className="flex-1 rounded-2xl bg-card px-3 pb-2 pt-3">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${label.toLowerCase()}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      className="flex-1 rounded-2xl bg-card px-3 pb-2 pt-3"
    >
      {content}
    </Pressable>
  );
}
