import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useTransactions } from "@/features/transactions/hooks/useTransactions";
import {
  spendingBounds,
  summarizeSpending,
  type SpendingGrouping,
  type SpendingPeriod,
} from "@/lib/spending";
import {
  loadSpendingCategoryRules,
  removeSpendingCategoryRule,
  saveSpendingCategoryRules,
  upsertSpendingCategoryRule,
  type SpendingCategoryRule,
} from "@/lib/spendingRules";
import { findInternalTransferIds, shiftISODate } from "@/lib/transactions";

export function useSpendingScreen() {
  const accountsQuery = useAccounts();
  const [today] = useState(() => new Date());
  const [period, setPeriod] = useState<SpendingPeriod>("month");
  const [grouping, setGrouping] = useState<SpendingGrouping>("establishment");
  const [rules, setRules] = useState<SpendingCategoryRule[]>([]);

  useEffect(() => {
    let active = true;
    loadSpendingCategoryRules().then((saved) => {
      if (active) setRules(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  const bounds = useMemo(() => spendingBounds(period, today), [period, today]);

  // Match Visão geral: only cash accounts feed the expense flow. Card invoices
  // are already represented by the debit that pays them.
  const accountIds = useMemo(
    () =>
      (accountsQuery.data ?? [])
        .filter((account) => account.kind !== "credit")
        .map((account) => account.id),
    [accountsQuery.data],
  );

  // Buffer before the period so transfers crossing its first day still pair.
  const fetchFrom = useMemo(() => shiftISODate(bounds.from, -3), [bounds.from]);
  const transactionsQuery = useTransactions({
    accountIds,
    from: fetchFrom,
    to: bounds.to,
  });

  const internalIds = useMemo(
    () => findInternalTransferIds(transactionsQuery.transactions),
    [transactionsQuery.transactions],
  );

  const summary = useMemo(
    () =>
      summarizeSpending(
        transactionsQuery.transactions,
        internalIds,
        bounds,
        grouping,
        rules,
      ),
    [transactionsQuery.transactions, internalIds, bounds, grouping, rules],
  );

  const updateRules = useCallback((next: SpendingCategoryRule[]) => {
    setRules(next);
    void saveSpendingCategoryRules(next);
  }, []);

  const setCategoryForEstablishment = useCallback(
    (name: string, category: string) =>
      updateRules(upsertSpendingCategoryRule(rules, name, category)),
    [rules, updateRules],
  );

  const removeCategoryForEstablishment = useCallback(
    (name: string) => updateRules(removeSpendingCategoryRule(rules, name)),
    [rules, updateRules],
  );

  const refetch = async () => {
    await Promise.all([accountsQuery.refetch(), transactionsQuery.refetch()]);
  };

  return {
    period,
    setPeriod,
    grouping,
    setGrouping,
    bounds,
    summary,
    setCategoryForEstablishment,
    removeCategoryForEstablishment,
    isLoading: accountsQuery.isLoading || transactionsQuery.isLoading,
    isError: accountsQuery.isError || transactionsQuery.isError,
    isRefetching: accountsQuery.isRefetching || transactionsQuery.isRefetching,
    refetch,
  };
}
