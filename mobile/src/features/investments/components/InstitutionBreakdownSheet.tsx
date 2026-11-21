import { useMemo } from "react";
import { Text, View } from "react-native";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import { relativeSyncLabel } from "@/lib/dates";
import { summarizeInvestmentsByInstitution } from "@/lib/investments";
import { formatBRL } from "@/lib/money";
import type { Cents, Investment } from "@/types/domain";

type Props = {
  visible: boolean;
  investments: Investment[];
  total: Cents;
  lastSync?: Date;
  onDismiss: () => void;
};

export function InstitutionBreakdownSheet({
  visible,
  investments,
  total,
  lastSync,
  onDismiss,
}: Props) {
  const rows = useMemo(
    () => summarizeInvestmentsByInstitution(investments),
    [investments],
  );

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Patrimônio por instituição"
      subtitle={`${relativeSyncLabel(lastSync)} · posição atual dos investimentos`}
    >
      <View className="gap-4">
        <View className="rounded-2xl bg-card px-4 py-3">
          <Text className="text-xs uppercase tracking-wider text-muted">
            Total investido
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className="pt-1 text-2xl font-semibold text-foreground"
          >
            {formatBRL(total)}
          </Text>
        </View>

        <View className="gap-4">
          {rows.map((row) => (
            <View key={row.key} className="flex-row items-center">
              <InstitutionLogo
                institution={row.logo}
                name={row.label}
                size={34}
              />

              <View className="min-w-0 flex-1 pl-3">
                <View className="flex-row items-center">
                  <Text
                    numberOfLines={1}
                    className="min-w-0 flex-1 text-sm font-medium text-foreground"
                  >
                    {row.label}
                  </Text>
                  <Text className="shrink-0 text-sm font-semibold text-foreground">
                    {formatBRL(row.balance)}
                  </Text>
                </View>

                <View className="mt-1 flex-row items-center">
                  <Text
                    numberOfLines={1}
                    className="min-w-0 flex-1 text-xs text-muted"
                  >
                    {row.count > 0
                      ? `${row.count} ${row.count === 1 ? "ativo" : "ativos"}`
                      : "Sem investimentos"}
                  </Text>
                  <Text className="shrink-0 text-xs text-muted">
                    {Math.round(row.share * 100)}%
                  </Text>
                </View>

                <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
                  <View
                    style={{ width: `${Math.round(row.share * 100)}%` }}
                    className="h-full rounded-full bg-accent"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </AppBottomSheet>
  );
}
