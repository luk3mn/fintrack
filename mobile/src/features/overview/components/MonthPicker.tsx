import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  label: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function MonthPicker({
  label,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: Props) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center px-1">
      <Text className="text-xs font-medium uppercase tracking-wide text-soft">
        {label}
      </Text>

      <View className="ml-1 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          disabled={!canGoPrev}
          hitSlop={8}
          onPress={onPrev}
          className="h-6 w-5 items-center justify-center active:opacity-60"
        >
          <Ionicons
            name="chevron-back"
            size={13}
            color={canGoPrev ? colors.accent : colors.border}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          disabled={!canGoNext}
          hitSlop={8}
          onPress={onNext}
          className="h-6 w-5 items-center justify-center active:opacity-60"
        >
          <Ionicons
            name="chevron-forward"
            size={13}
            color={canGoNext ? colors.accent : colors.border}
          />
        </Pressable>
      </View>
    </View>
  );
}
