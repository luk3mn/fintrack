import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useItems } from "@/features/accounts/hooks/useItems";
import { withDisplayNames } from "@/lib/connections";
import {
  DEFAULT_TRANSACTION_FILTERS,
  loadTransactionFilters,
  saveTransactionFilters,
  type TransactionFilters,
} from "@/lib/transactionFilters";
import {
  categoryLabel,
  findInternalTransferIds,
  groupByDay,
  isInternalCardPayment,
  normalizeText,
  periodBounds,
  shiftISODate,
  summarizeTransactions,
  type TransactionItem,
  type TransactionSection,
} from "@/lib/transactions";
import { useTransactions } from "./useTransactions";

const updatedAt = (value?: string) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export function useTransactionsScreen() {
  const accountsQuery = useAccounts();
  const itemsQuery = useItems();
  const [today] = useState(() => new Date());
  const [filters, setFilters] = useState<TransactionFilters>(
    DEFAULT_TRANSACTION_FILTERS,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    void loadTransactionFilters().then((stored) => {
      if (active) setFilters(stored);
    });

    return () => {
      active = false;
    };
  }, []);

  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );

  const connections = useMemo(
    () => withDisplayNames(itemsQuery.data ?? []),
    [itemsQuery.data],
  );

  const connectionById = useMemo(
    () => new Map(connections.map((connection) => [connection.id, connection])),
    [connections],
  );

  const institutions = useMemo(() => {
    const names = accounts
      .map((account) => {
        const connection = connectionById.get(account.itemId);
        return connection?.displayName ?? account.institution;
      })
      .filter((name): name is string => Boolean(name));

    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [accounts, connectionById]);

  const dataReady = !accountsQuery.isLoading && !itemsQuery.isLoading;

  // Ignore saved banks that no longer exist instead of filtering everything out.
  const effectiveFilters = useMemo<TransactionFilters>(() => {
    if (!dataReady) return filters;

    const valid = filters.institutions.filter((name) =>
      institutions.includes(name),
    );

    return valid.length === filters.institutions.length
      ? filters
      : { ...filters, institutions: valid };
  }, [dataReady, filters, institutions]);

  const selectedInstitutions = effectiveFilters.institutions;

  const bounds = useMemo(
    () => periodBounds(effectiveFilters.period, today),
    [effectiveFilters.period, today],
  );
  const accountIds = useMemo(
    () => accounts.map((account) => account.id),
    [accounts],
  );
  // Fetch a small buffer before the period so a transfer sent on the last day
  // of the previous month can still be paired with its credit in this period.
  const fetchFrom = useMemo(() => shiftISODate(bounds.from, -3), [bounds.from]);
  const transactionsQuery = useTransactions({
    accountIds,
    from: fetchFrom,
    to: bounds.to,
  });

  const accountById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );

  const internalTransferIds = useMemo(
    () => findInternalTransferIds(transactionsQuery.transactions),
    [transactionsQuery.transactions],
  );

  const allTransactions = useMemo<TransactionItem[]>(
    () =>
      transactionsQuery.transactions
        .filter(
          (transaction) =>
            transaction.date.slice(0, 10) >= bounds.from &&
            transaction.date.slice(0, 10) <= bounds.to,
        )
        .map((transaction) => {
          const account = accountById.get(transaction.accountId);
          const connection = account
            ? connectionById.get(account.itemId)
            : undefined;

          return {
            ...transaction,
            institution:
              connection?.displayName ?? account?.institution ?? "Conta",
            accountName: account?.name ?? "",
            categoryLabel: categoryLabel(transaction.category),
            isInternalTransfer:
              internalTransferIds.has(transaction.id) ||
              isInternalCardPayment(
                transaction.description,
                transaction.category,
              ) ||
              (account?.kind === "credit" &&
                normalizeText(transaction.description).includes(
                  "pagamento recebido",
                )),
          };
        }),
    [
      transactionsQuery.transactions,
      internalTransferIds,
      bounds.from,
      bounds.to,
      accountById,
      connectionById,
    ],
  );

  const visibleTransactions = useMemo(() => {
    const term = normalizeText(search);

    return allTransactions
      .filter((transaction) => {
        if (
          selectedInstitutions.length > 0 &&
          !selectedInstitutions.includes(transaction.institution)
        ) {
          return false;
        }
        if (effectiveFilters.type !== "all" && transaction.isInternalTransfer) {
          return false;
        }
        if (effectiveFilters.type === "income" && transaction.amount <= 0) {
          return false;
        }
        if (effectiveFilters.type === "expense" && transaction.amount >= 0) {
          return false;
        }
        if (!term) return true;

        return normalizeText(
          [
            transaction.description,
            transaction.categoryLabel,
            transaction.institution,
            transaction.accountName,
          ].join(" "),
        ).includes(term);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [allTransactions, selectedInstitutions, effectiveFilters.type, search]);

  const sections = useMemo<TransactionSection[]>(
    () => groupByDay(visibleTransactions, today),
    [visibleTransactions, today],
  );

  const summary = useMemo(
    () => summarizeTransactions(visibleTransactions),
    [visibleTransactions],
  );

  const lastSync = useMemo(() => {
    const stamps = (itemsQuery.data ?? [])
      .map((item) => updatedAt(item.lastUpdatedAt))
      .filter((stamp) => stamp > 0);

    return stamps.length ? new Date(Math.max(...stamps)) : undefined;
  }, [itemsQuery.data]);

  const applyFilters = useCallback(
    (next: TransactionFilters) => {
      const normalized: TransactionFilters = {
        ...next,
        institutions: next.institutions.filter((name) =>
          institutions.includes(name),
        ),
      };

      setFilters(normalized);
      void saveTransactionFilters(normalized);
    },
    [institutions],
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setFilters(DEFAULT_TRANSACTION_FILTERS);
    void saveTransactionFilters(DEFAULT_TRANSACTION_FILTERS);
  }, []);

  const activeFilterCount =
    (selectedInstitutions.length > 0 ? 1 : 0) +
    (effectiveFilters.type === "all" ? 0 : 1) +
    (effectiveFilters.period === "current-month" ? 0 : 1);

  const isRefetching =
    accountsQuery.isRefetching ||
    itemsQuery.isRefetching ||
    transactionsQuery.isRefetching;

  const refetch = async () => {
    await Promise.all([
      accountsQuery.refetch(),
      itemsQuery.refetch(),
      transactionsQuery.refetch(),
    ]);
  };

  return {
    sections,
    summary,
    lastSync,
    filters: effectiveFilters,
    selectedInstitutions,
    institutions,
    applyFilters,
    resetFilters,
    search,
    setSearch,
    activeFilterCount,
    isLoading: accountsQuery.isLoading || transactionsQuery.isLoading,
    isError: accountsQuery.isError || transactionsQuery.isError,
    isSyncLoading: itemsQuery.isLoading,
    isRefetching,
    refetch,
  };
}
