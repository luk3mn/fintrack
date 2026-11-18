import { ActivityIndicator, Pressable, Text } from "react-native";

type Variant = "primary" | "secondary";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
};

const containers: Record<Variant, string> = {
  primary: "bg-emerald-500",
  secondary: "bg-zinc-800",
};

const labels: Record<Variant, string> = {
  primary: "text-emerald-950",
  secondary: "text-zinc-100",
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: Props) {
  const inactive = loading || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      className={`h-12 items-center justify-center rounded-xl active:opacity-80 ${containers[variant]} ${inactive ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color="#a1a1aa" />
      ) : (
        <Text className={`text-base font-semibold ${labels[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
