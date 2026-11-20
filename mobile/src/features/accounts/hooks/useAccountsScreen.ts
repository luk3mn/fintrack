import { useMemo } from "react";
import { summarizeAccounts } from "@/lib/summary";
import type { Account, AccountKind, Connection } from "@/types/domain";
import { useAccounts } from "./useAccounts";
import { useItems } from "./useItems";

const ORDER: Record<AccountKind, number> = {
  checking: 0,
  savings: 1,
  credit: 2,
};

const updatedAt = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

export function useAccountsScreen() {
  const accountsQuery = useAccounts();
  const itemsQuery = useItems();

  const accounts = useMemo(
    () =>
      [...(accountsQuery.data ?? [])].sort(
        (a: Account, b: Account) =>
          ORDER[a.kind] - ORDER[b.kind] || b.balance - a.balance,
      ),
    [accountsQuery.data],
  );

  const summary = useMemo(() => summarizeAccounts(accounts), [accounts]);

  const connections = useMemo(() => {
    const sorted = [...(itemsQuery.data ?? [])].sort(
      (a: Connection, b: Connection) =>
        updatedAt(b.lastUpdatedAt) - updatedAt(a.lastUpdatedAt),
    );

    const counts = new Map<string, number>();

    for (const connection of sorted) {
      if (!connection.institution) continue;
      counts.set(
        connection.institution,
        (counts.get(connection.institution) ?? 0) + 1,
      );
    }

    return sorted.map((connection) => {
      const duplicated =
        connection.institution &&
        (counts.get(connection.institution) ?? 0) > 1;
      const suffix = duplicated && connection.personType
        ? ` ${connection.personType}`
        : "";

      return {
        ...connection,
        displayName: connection.institution
          ? `${connection.institution}${suffix}`
          : undefined,
      };
    });
  }, [itemsQuery.data]);

  const lastSync = useMemo(() => {
    const stamps = (itemsQuery.data ?? [])
      .map((item) => updatedAt(item.lastUpdatedAt))
      .filter((stamp) => stamp > 0);

    return stamps.length ? new Date(Math.max(...stamps)) : undefined;
  }, [itemsQuery.data]);

  const isRefetching =
    accountsQuery.isRefetching || itemsQuery.isRefetching;

  const refetch = async () => {
    await Promise.all([accountsQuery.refetch(), itemsQuery.refetch()]);
  };

  return {
    accounts,
    connections,
    summary,
    lastSync,
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    isConnectionsLoading: itemsQuery.isLoading,
    isConnectionsError: itemsQuery.isError,
    isRefetching,
    refetch,
  };
}
