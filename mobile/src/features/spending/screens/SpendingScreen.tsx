import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatBRL } from "@/lib/money";
import { spendingRangeLabel } from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";
import { EstablishmentRow } from "../components/EstablishmentRow";
import { SpendingPeriodFilter } from "../components/SpendingPeriodFilter";
import { useSpendingScreen } from "../hooks/useSpendingScreen";

const TOP_PADDING = 24;

function BackButton() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      className="size-9 items-center justify-center rounded-full bg-card active:opacity-70"
    >
      <Ionicons name="arrow-back" size={18} color={colors.foreground} />
    </Pressable>
  );
}

function FloatingBackButton({ top }: { top: number }) {
  return (
    <View className="absolute left-4" style={{ top, zIndex: 10 }}>
      <BackButton />
    </View>
  );
}

export function SpendingScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {
    period,
    setPeriod,
    bounds,
    summary,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useSpendingScreen();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <FloatingBackButton top={insets.top + 8} />
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4 bg-background px-6"
        style={{ paddingTop: insets.top }}
      >
        <FloatingBackButton top={insets.top + 8} />
        <Text className="text-center text-base text-muted">
          Não foi possível carregar suas transações.
        </Text>
        <View className="w-full">
          <Button title="Tentar novamente" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  const max = summary.rows[0]?.total ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top > 0 ? insets.top + 12 : TOP_PADDING,
        paddingBottom: insets.bottom + 80,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void refetch();
          }}
          tintColor={colors.muted}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="text-2xl font-semibold text-foreground"
            >
              Para onde foi
            </Text>
          </View>
        </View>
        <Text className="pt-3 text-xs text-muted">
          {spendingRangeLabel(bounds)} · gastos por estabelecimento
        </Text>

        <View className="pt-4">
          <SpendingPeriodFilter value={period} onChange={setPeriod} />
        </View>

        <View className="pt-4">
          <View className="rounded-2xl bg-card px-4 py-3">
            <Text className="text-xs uppercase tracking-wider text-muted">
              Total gasto
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className="pt-1 text-2xl font-semibold text-foreground"
            >
              {formatBRL(summary.total)}
            </Text>
            <Text className="pt-1 text-xs text-muted">
              {summary.count}{" "}
              {summary.count === 1 ? "estabelecimento" : "estabelecimentos"}
            </Text>
          </View>
        </View>

        <View className="pt-6">
          <SectionTitle title="Estabelecimentos" />
        </View>

        {summary.rows.length === 0 ? (
          <View className="rounded-2xl bg-card px-4 py-5">
            <Text className="text-center text-xs text-muted">
              Nenhum gasto neste período.
            </Text>
          </View>
        ) : (
          <View className="pt-4">
            <View className="gap-5">
              {summary.rows.map((row) => (
                <EstablishmentRow key={row.key} row={row} max={max} />
              ))}
            </View>

            <Text className="pt-6 text-center text-xs text-subtle">
              Os nomes vêm da descrição das transações.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
