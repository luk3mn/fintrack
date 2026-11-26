import { useMemo } from "react";
import { Text, View } from "react-native";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { categoryLabel } from "@/lib/categories";
import { relativeSyncLabel, shortDateLabel } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import type { Account, Cents, Connection, Transaction } from "@/types/domain";

type Props = {
  visible: boolean;
  transactions: Transaction[];
  accounts: Account[];
  connections: Connection[];
  total: Cents;
  periodLabel: string;
  lastSync?: Date;
  onDismiss: () => void;
};

type IncomeRow = {
  id: string;
  description: string;
  details: string;
  amount: Cents;
};

export function IncomeBreakdownSheet({
  visible,
  transactions,
  accounts,
  connections,
  total,
  periodLabel,
  lastSync,
  onDismiss,
}: Props) {
  const rows = useMemo<IncomeRow[]>(() => {
    const accountById = new Map(
      accounts.map((account) => [account.id, account]),
    );
    const institutionByItem = new Map(
      connections.map((item) => [
        item.id,
        item.displayName ?? item.institution ?? "",
      ]),
    );

    return transactions
      .map((transaction) => {
        const account = accountById.get(transaction.accountId);
        const institution = account
          ? (institutionByItem.get(account.itemId) ?? account.institution)
          : undefined;
        const category = transaction.category?.trim()
          ? categoryLabel(transaction.category)
          : undefined;
        const details = [
          shortDateLabel(transaction.date),
          category,
          institution,
        ]
          .filter(Boolean)
          .join(" · ");

        return {
          id: transaction.id,
          description: transaction.description.trim() || "Entrada",
          details,
          amount: transaction.amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, accounts, connections]);

  const period = periodLabel.charAt(0) + periodLabel.slice(1).toLowerCase();

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Entradas"
      subtitle={`${period} · ${relativeSyncLabel(lastSync)}`}
      maxHeight="50%"
    >
      <View className="gap-5">
        <View className="rounded-2xl bg-card px-4 py-3">
          <Text className="text-xs uppercase tracking-wider text-muted">
            Total de entradas
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className="pt-1 text-2xl font-semibold text-foreground"
          >
            {formatBRL(total)}
          </Text>
          <Text className="pt-1 text-xs text-muted">
            {rows.length} {rows.length === 1 ? "entrada" : "entradas"}
          </Text>
        </View>

        {rows.length === 0 ? (
          <Text className="py-2 text-sm text-muted">
            Nenhuma entrada neste período.
          </Text>
        ) : (
          <View className="gap-4">
            {rows.map((row) => (
              <View key={row.id} className="flex-row items-start gap-3">
                <View className="min-w-0 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-medium text-foreground"
                  >
                    {row.description}
                  </Text>
                  <Text numberOfLines={1} className="pt-1 text-xs text-muted">
                    {row.details}
                  </Text>
                </View>

                <Text className="shrink-0 text-sm font-semibold text-foreground">
                  {formatBRL(row.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </AppBottomSheet>
  );
}
