import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useThemeColors } from "@/theme/tokens";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...props }: Props) {
  const colors = useThemeColors();

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-muted">{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        className={`h-12 rounded-xl border bg-card px-4 text-base text-foreground ${error ? "border-danger" : "border-border"}`}
        {...props}
      />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
