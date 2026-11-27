import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedChip } from "@/components/ui/animated-chip";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatBRL } from "@/lib/money";
import {
  SPENDING_GROUPINGS,
  spendingRangeLabel,
  type SpendingGrouping,
  type SpendingRow as SpendingRowData,
} from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";
import { EstablishmentCategorySheet } from "../components/EstablishmentCategorySheet";
import { SpendingPeriodFilter } from "../components/SpendingPeriodFilter";
import { SpendingRow } from "../components/SpendingRow";
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
    grouping,
    setGrouping,
    bounds,
    summary,
    setCategoryForEstablishment,
    removeCategoryForEstablishment,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useSpendingScreen();
  const [editing, setEditing] = useState<SpendingRowData | null>(null);

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
    <>
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
            {spendingRangeLabel(bounds)} ·{" "}
            {grouping === "category"
              ? "gastos por categoria"
              : "gastos por estabelecimento"}
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
                {grouping === "category"
                  ? summary.count === 1
                    ? "categoria"
                    : "categorias"
                  : summary.count === 1
                    ? "estabelecimento"
                    : "estabelecimentos"}
              </Text>
            </View>
          </View>

          <View className="pt-6">
            <AnimatedChip.Group
              value={grouping}
              onValueChange={(next) => setGrouping(next as SpendingGrouping)}
            >
              {SPENDING_GROUPINGS.map((option) => (
                <AnimatedChip.Item
                  key={option.key}
                  value={option.key}
                  activeColor={colors.primary}
                  inactiveColor={colors.card}
                >
                  <AnimatedChip.Icon>
                    {({ selected }) => (
                      <Ionicons
                        name={
                          option.key === "category"
                            ? "grid-outline"
                            : "storefront-outline"
                        }
                        size={20}
                        color={
                          selected ? colors.primaryForeground : colors.muted
                        }
                      />
                    )}
                  </AnimatedChip.Icon>
                  <AnimatedChip.Label color={colors.primaryForeground}>
                    {option.label}
                  </AnimatedChip.Label>
                </AnimatedChip.Item>
              ))}
            </AnimatedChip.Group>
          </View>

          <View className="pt-6">
            <SectionTitle
              title={
                grouping === "category" ? "Categorias" : "Estabelecimentos"
              }
            />
            {grouping === "establishment" ? (
              <Text className="pt-1 px-1 text-xs text-muted">
                Toque em um estabelecimento para definir sua categoria.
              </Text>
            ) : null}
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
                  <SpendingRow
                    key={row.key}
                    row={row}
                    grouping={grouping}
                    max={max}
                    onPress={
                      grouping === "establishment"
                        ? () => setEditing(row)
                        : undefined
                    }
                  />
                ))}
              </View>

              <Text className="pt-6 text-center text-xs text-subtle">
                {grouping === "category"
                  ? "As categorias vêm das transações e das suas regras."
                  : "Os nomes vêm da descrição das transações."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <EstablishmentCategorySheet
        visible={editing !== null}
        name={editing?.name ?? ""}
        currentCategory={editing?.category ?? ""}
        hasRule={editing?.customCategory ?? false}
        onDismiss={() => setEditing(null)}
        onSave={(category) => {
          if (editing) setCategoryForEstablishment(editing.name, category);
        }}
        onRemove={() => {
          if (editing) removeCategoryForEstablishment(editing.name);
        }}
      />
    </>
  );
}
