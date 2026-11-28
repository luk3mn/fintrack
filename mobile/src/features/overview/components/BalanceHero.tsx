import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Summary } from "@/lib/summary";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  summary: Summary;
  onPress: () => void;
};

export function BalanceHero({ summary, onPress }: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ver saldo por instituição"
      accessibilityHint="Abre o detalhamento por banco e conta"
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      className="rounded-3xl bg-card px-4 pb-4 pt-5"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-medium uppercase tracking-wider text-muted">
          Saldo em contas
        </Text>
        <Ionicons
          name="arrow-up-right-box-outline"
          size={20}
          color={colors.primary}
        />
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        className="pt-2 text-3xl font-semibold leading-10 text-foreground"
      >
        {formatBRL(summary.cash)}
      </Text>

      <View className="gap-1 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted">Faturas de cartão</Text>
          <Text className="text-xs text-warm">
            − {formatBRL(Math.abs(summary.cardBills))}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-muted">
            Saldo após faturas
          </Text>
          <Text className="text-xs font-semibold text-foreground">
            {formatBRL(summary.available)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
