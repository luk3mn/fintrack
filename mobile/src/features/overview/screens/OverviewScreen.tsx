import { useState } from "react";
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
import { CashFlowChart } from "@/components/ui/CashFlowChart";
import { signOut } from "@/features/auth/api/auth";
import { formatBRLCompact } from "@/lib/money";
import { useThemeColors } from "@/theme/tokens";
import { AccountBalancesSheet } from "../components/AccountBalancesSheet";
import { BalanceHero } from "../components/BalanceHero";
import { BudgetSection } from "../components/BudgetSection";
import { IncomeBreakdownSheet } from "../components/IncomeBreakdownSheet";
import { MetricCard } from "../components/MetricCard";
import { MonthPicker } from "../components/MonthPicker";
import { OverviewHeader } from "../components/OverviewHeader";
import { SectionHeader } from "../components/SectionHeader";
import { useOverview } from "../hooks/useOverview";

const TOP_PADDING = 24;

export function OverviewScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [balancesOpen, setBalancesOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const {
    accounts,
    connections,
    summary,
    monthLabel,
    canGoNext,
    canGoPrev,
    goToPreviousMonth,
    goToNextMonth,
    income,
    incomeTransactions,
    expenses,
    savingsRate,
    incomeDelta,
    expensesDelta,
    savingsDelta,
    flow,
    sparklines,
    currentBucket,
    lastSync,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useOverview();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
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
        <Text className="text-center text-base text-muted">
          Não foi possível carregar suas contas.
        </Text>
        <View className="w-full">
          <Button title="Tentar novamente" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

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
          <OverviewHeader lastSync={lastSync} />

          <View className="pt-3">
            <MonthPicker
              label={monthLabel}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              onPrev={goToPreviousMonth}
              onNext={goToNextMonth}
            />
          </View>

          <View className="pt-4">
            <BalanceHero
              summary={summary}
              onPress={() => setBalancesOpen(true)}
            />
          </View>

          <View className="flex-row gap-2 pt-4">
            <MetricCard
              label="Entradas"
              value={formatBRLCompact(income)}
              delta={incomeDelta}
              sparkline={sparklines.income}
              sparkColor={colors.primary}
              onPress={() => setIncomeOpen(true)}
            />
            <MetricCard
              label="Saídas"
              value={formatBRLCompact(expenses)}
              delta={expensesDelta}
              sparkline={sparklines.expenses}
              sparkColor={colors.warm}
            />
            <MetricCard
              label="Economia"
              value={
                savingsRate === undefined ? "—" : `${Math.round(savingsRate)}%`
              }
              delta={savingsDelta}
              deltaSuffix=" p.p."
              sparkline={sparklines.savings}
              sparkColor={colors.accent}
            />
          </View>

          <View className="pt-6">
            <SectionHeader title="Fluxo do mês" />
          </View>

          <View className="pt-2">
            <CashFlowChart
              data={flow}
              initialSelected={currentBucket}
              granularity="semana"
              onPress={() => router.navigate("/spending")}
            />
          </View>

          <View className="pt-6">
            <SectionHeader title="Orçamentos" />
          </View>

          <View className="pt-2">
            <BudgetSection />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            onPress={() => {
              void signOut();
            }}
            className="mt-8 flex-row items-center justify-center gap-2 py-3 active:opacity-60"
          >
            <Ionicons name="log-out-outline" size={14} color={colors.subtle} />
            <Text className="text-xs text-subtle">Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AccountBalancesSheet
        visible={balancesOpen}
        accounts={accounts}
        connections={connections}
        summary={summary}
        lastSync={lastSync}
        onDismiss={() => setBalancesOpen(false)}
      />

      <IncomeBreakdownSheet
        visible={incomeOpen}
        transactions={incomeTransactions}
        accounts={accounts}
        connections={connections}
        total={income}
        periodLabel={monthLabel}
        lastSync={lastSync}
        onDismiss={() => setIncomeOpen(false)}
      />
    </>
  );
}
