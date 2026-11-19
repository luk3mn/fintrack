import { ActivityIndicator, Pressable, Text } from "react-native";
import { useThemeColors } from "@/theme/tokens";

type Variant = "primary" | "secondary";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
};

const containers: Record<Variant, string> = {
  primary: "bg-primary",
  secondary: "border border-border bg-card",
};

const labels: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-foreground",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: Props) {
  const colors = useThemeColors();
  const inactive = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      className={`h-12 items-center justify-center rounded-xl active:opacity-80 ${containers[variant]} ${inactive ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={colors.muted} />
      ) : (
        <Text className={`text-base font-semibold ${labels[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
