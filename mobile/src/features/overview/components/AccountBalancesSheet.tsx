import { useMemo } from "react";
import { Text, View } from "react-native";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import { relativeSyncLabel } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { groupAccountsByInstitution, type Summary } from "@/lib/summary";
import type { Account, Connection } from "@/types/domain";

type Props = {
  visible: boolean;
  accounts: Account[];
  connections: Connection[];
  summary: Summary;
  lastSync?: Date;
  onDismiss: () => void;
};

const ACCOUNT_INDENT = 46;

export function AccountBalancesSheet({
  visible,
  accounts,
  connections,
  summary,
  lastSync,
  onDismiss,
}: Props) {
  const groups = useMemo(
    () => groupAccountsByInstitution(accounts, connections),
    [accounts, connections],
  );

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Saldo por instituição"
      subtitle={`${relativeSyncLabel(lastSync)} · saldo disponível em cada conta`}
    >
      <View className="gap-5">
        <View className="rounded-2xl bg-card px-4 py-3">
          <Text className="text-xs uppercase tracking-wider text-muted">
            Saldo em contas
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className="pt-1 text-2xl font-semibold text-foreground"
          >
            {formatBRL(summary.cash)}
          </Text>
        </View>

        <View className="gap-5">
          {groups.map((group) => (
            <View key={group.key} className="gap-2">
              <View className="flex-row items-center">
                <InstitutionLogo
                  institution={group.logo}
                  name={group.label}
                  size={34}
                />

                <View className="min-w-0 flex-1 pl-3">
                  <View className="flex-row items-center gap-2">
                    <Text
                      numberOfLines={1}
                      className="min-w-0 flex-1 text-sm font-medium text-foreground"
                    >
                      {group.label}
                    </Text>
                    <Text className="shrink-0 text-sm font-semibold text-foreground">
                      {formatBRL(group.cash)}
                    </Text>
                  </View>

                  <Text className="pt-0.5 text-xs text-muted">
                    {group.accounts.length}{" "}
                    {group.accounts.length === 1 ? "conta" : "contas"}
                  </Text>
                </View>
              </View>

              <View className="gap-1.5" style={{ paddingLeft: ACCOUNT_INDENT }}>
                {group.accounts.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between gap-3"
                  >
                    <Text
                      numberOfLines={1}
                      className="min-w-0 flex-1 text-xs text-muted"
                    >
                      {item.label}
                    </Text>
                    <Text
                      className={`shrink-0 text-xs font-medium ${
                        item.kind === "credit"
                          ? "text-danger"
                          : "text-foreground"
                      }`}
                    >
                      {formatBRL(item.balance)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {summary.cardBills !== 0 ? (
          <View className="gap-1 border-t border-border pt-3">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs text-muted">Faturas de cartão</Text>
              <Text className="text-xs text-muted">
                − {formatBRL(Math.abs(summary.cardBills))}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xs font-medium text-foreground">
                Saldo após faturas
              </Text>
              <Text className="text-xs font-medium text-foreground">
                {formatBRL(summary.available)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </AppBottomSheet>
  );
}
