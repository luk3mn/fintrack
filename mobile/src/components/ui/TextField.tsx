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
      <Text className="text-xs font-medium text-muted">{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        className={`h-13 rounded-xl bg-card px-4 text-sm text-foreground ${error ? "border border-danger" : ""}`}
        {...props}
      />
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
