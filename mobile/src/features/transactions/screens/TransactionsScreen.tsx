import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import type { TransactionItem, TransactionSection } from "@/lib/transactions";
import { FilterChips } from "../components/FilterChips";
import { TransactionRow } from "../components/TransactionRow";
import { TransactionSearch } from "../components/TransactionSearch";
import { TransactionSectionHeader } from "../components/TransactionSectionHeader";
import { TransactionSummary } from "../components/TransactionSummary";
import { TransactionsFilterSheet } from "../components/TransactionsFilterSheet";
import { TransactionsHeader } from "../components/TransactionsHeader";
import { useTransactionsScreen } from "../hooks/useTransactionsScreen";
import { useTransactionColors } from "../theme";

const TOP_PADDING = 24;

export function TransactionsScreen() {
  const colors = useTransactionColors();
  const insets = useSafeAreaInsets();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    sections,
    summary,
    lastSync,
    filters,
    institutions,
    applyFilters,
    resetFilters,
    periodLabelText,
    hasPeriodFilter,
    institutionLabel,
    hasInstitutionFilter,
    typeFilterLabel,
    hasTypeFilter,
    search,
    setSearch,
    activeFilterCount,
    isLoading,
    isError,
    isSyncLoading,
    isRefetching,
    refetch,
  } = useTransactionsScreen();

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4 px-6"
        style={{ backgroundColor: colors.background, paddingTop: insets.top }}
      >
        <Text className="text-center text-base" style={{ color: colors.muted }}>
          Não foi possível carregar suas transações.
        </Text>
        <View className="w-full">
          <Button title="Tentar novamente" onPress={() => void refetch()} />
        </View>
      </View>
    );
  }

  return (
    <>
      <SectionList<TransactionItem, TransactionSection>
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingTop: insets.top > 0 ? insets.top + 12 : TOP_PADDING,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        sections={sections}
        keyExtractor={(item) => item.id}
        initialNumToRender={12}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={colors.muted}
            colors={[colors.accent]}
          />
        }
        renderSectionHeader={({ section }) => (
          <TransactionSectionHeader
            label={section.label}
            total={section.total}
            colors={colors}
          />
        )}
        renderItem={({ item }) => (
          <TransactionRow item={item} colors={colors} />
        )}
        ListHeaderComponent={
          <View className="gap-4">
            <TransactionsHeader
              lastSync={lastSync}
              loading={isSyncLoading}
              onRefresh={() => void refetch()}
              colors={colors}
            />

            <TransactionSearch
              value={search}
              onChangeValue={setSearch}
              onFilterPress={() => setFiltersOpen(true)}
              activeFilterCount={activeFilterCount}
              colors={colors}
            />

            <FilterChips
              periodLabel={periodLabelText}
              institutionLabel={institutionLabel}
              typeFilterLabel={typeFilterLabel}
              hasPeriodFilter={hasPeriodFilter}
              hasInstitutionFilter={hasInstitutionFilter}
              hasTypeFilter={hasTypeFilter}
              onOpenFilters={() => setFiltersOpen(true)}
              colors={colors}
            />

            <TransactionSummary summary={summary} colors={colors} />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center px-6 py-10">
            <Text
              className="text-center text-sm"
              style={{ color: colors.muted }}
            >
              Nenhuma transação encontrada para os filtros selecionados.
            </Text>
            {activeFilterCount > 0 || search.length > 0 ? (
              <PressableReset onPress={resetFilters} colors={colors} />
            ) : null}
          </View>
        }
      />

      <TransactionsFilterSheet
        visible={filtersOpen}
        onDismiss={() => setFiltersOpen(false)}
        filters={filters}
        institutions={institutions}
        onApply={applyFilters}
        colors={colors}
      />
    </>
  );
}

type ResetProps = {
  onPress: () => void;
  colors: ReturnType<typeof useTransactionColors>;
};

function PressableReset({ onPress, colors }: ResetProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="active:opacity-60"
    >
      <Text
        className="pt-4 text-sm font-medium"
        style={{ color: colors.accent }}
      >
        Limpar filtros
      </Text>
    </Pressable>
  );
}
