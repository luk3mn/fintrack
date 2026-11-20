import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/theme/tokens";
import { AllocationSection } from "../components/AllocationSection";
import { InstitutionBreakdownSheet } from "../components/InstitutionBreakdownSheet";
import { InvestmentsHeader } from "../components/InvestmentsHeader";
import { InvestmentsHero } from "../components/InvestmentsHero";
import { MaturitySection } from "../components/MaturitySection";
import { PortfolioSection } from "../components/PortfolioSection";
import { useInvestmentsScreen } from "../hooks/useInvestmentsScreen";

const TOP_PADDING = 24;

export function InvestmentsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isBreakdownOpen, setBreakdownOpen] = useState(false);
  const {
    investments,
    visibleInvestments,
    summary,
    filter,
    setFilter,
    lastSync,
    isLoading,
    isError,
    isSyncLoading,
    isRefetching,
    refetch,
  } = useInvestmentsScreen();

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
          Não foi possível carregar seus investimentos.
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
        showsVerticalScrollIndicator={false}
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
      >
        <View className="px-4">
          <InvestmentsHeader lastSync={lastSync} loading={isSyncLoading} />

          <View className="pt-3">
            <InvestmentsHero
              summary={summary}
              onPress={() => setBreakdownOpen(true)}
            />
          </View>

          <AllocationSection summary={summary} />
          <MaturitySection summary={summary} />

          <PortfolioSection
            investments={visibleInvestments}
            filter={filter}
            onFilterChange={setFilter}
          />
        </View>
      </ScrollView>

      <InstitutionBreakdownSheet
        visible={isBreakdownOpen}
        investments={investments}
        total={summary.total}
        lastSync={lastSync}
        onDismiss={() => setBreakdownOpen(false)}
      />
    </>
  );
}
