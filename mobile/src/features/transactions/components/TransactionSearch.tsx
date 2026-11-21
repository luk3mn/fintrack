import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import type { TransactionColors } from "../theme";

type Props = {
  value: string;
  onChangeValue: (value: string) => void;
  onFilterPress: () => void;
  activeFilterCount: number;
  colors: TransactionColors;
};

export function TransactionSearch({
  value,
  onChangeValue,
  onFilterPress,
  activeFilterCount,
  colors,
}: Props) {
  return (
    <View
      className="h-11 flex-row items-center rounded-xl px-3"
      style={{ backgroundColor: colors.card }}
    >
      <Ionicons name="search-outline" size={18} color={colors.subtle} />

      <TextInput
        value={value}
        onChangeText={onChangeValue}
        placeholder="Buscar descrição, loja ou tag"
        placeholderTextColor={colors.subtle}
        returnKeyType="search"
        autoCorrect={false}
        className="flex-1 px-2 text-sm"
        style={{ color: colors.foreground }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir filtros"
        onPress={onFilterPress}
        className="relative h-7 w-7 items-center justify-center active:opacity-60"
      >
        <Ionicons name="options-outline" size={18} color={colors.foreground} />

        {activeFilterCount > 0 ? (
          <View
            className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full px-1"
            style={{ backgroundColor: colors.accent }}
          >
            <Text
              className="text-xs font-medium leading-none"
              style={{ color: colors.accentForeground }}
            >
              {activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
