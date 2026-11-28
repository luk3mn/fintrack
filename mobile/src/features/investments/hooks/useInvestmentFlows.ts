import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { queryKeys } from "@/api/keys";
import { fetchPeriodTransactions } from "@/api/transactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import {
  INVESTMENT_FLOW_ORDER,
  investmentFlowCategory,
  isInvestmentRedemption,
  type InvestmentFlowCategory,
} from "@/lib/investments";
import {
  findInternalTransferIds,
  isInternalCardPayment,
  shiftISODate,
} from "@/lib/transactions";
import type { Cents } from "@/types/domain";

export type InvestmentFlowPoint = {
  label: string;
  fullLabel: string;
} & Record<InvestmentFlowCategory, Cents>;

const pad = (value: number) => String(value).padStart(2, "0");

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const emptyTotals = (): Record<InvestmentFlowCategory, Cents> => ({
  fixed: 0,
  funds: 0,
  equity: 0,
  other: 0,
});

/**
 * Monthly accumulated applications by investment type. Redemptions and yield
 * are excluded so every series stays non-negative; values come only from real
 * cash transactions because the investments endpoint has no history.
 */
export function useInvestmentFlows() {
  const accountsQuery = useAccounts();
  const [today] = useState(() => new Date());

  const cashAccounts = useMemo(
    () =>
      (accountsQuery.data ?? []).filter((account) => account.kind !== "credit"),
    [accountsQuery.data],
  );

  const months = useMemo(
    () =>
      Array.from(
        { length: today.getMonth() + 1 },
        (_, index) => new Date(today.getFullYear(), index, 1),
      ),
    [today],
  );

  // A small buffer before January lets transfers crossing the year boundary
  // find their pair; the month filter below still ignores anything outside.
  const from = shiftISODate(isoDate(months[0]), -3);
  const to = isoDate(today);

  const transactionQueries = useQueries({
    queries: cashAccounts.map((account) => ({
      queryKey: queryKeys.periodTransactions(account.id, from, to),
      queryFn: () => fetchPeriodTransactions(account.id, from, to),
      staleTime: 5 * 60_000,
    })),
  });

  const transactions = useMemo(
    () => transactionQueries.flatMap((query) => query.data ?? []),
    [transactionQueries],
  );

  const flows = useMemo(() => {
    const internalIds = findInternalTransferIds(transactions);
    const deltas = months.map(emptyTotals);

    for (const transaction of transactions) {
      const date = transaction.date.slice(0, 10);
      if (date > to) continue;

      const monthIndex = Number(date.slice(5, 7)) - 1;
      if (!Number.isInteger(monthIndex) || !deltas[monthIndex]) continue;
      if (
        internalIds.has(transaction.id) ||
        isInternalCardPayment(transaction.description, transaction.category)
      ) {
        continue;
      }

      const category = investmentFlowCategory(transaction);
      if (!category || isInvestmentRedemption(transaction)) continue;

      const amount = Math.abs(transaction.amount);
      if (amount === 0) continue;

      deltas[monthIndex][category] += amount;
    }

    const running = emptyTotals();
    return months.map((month, index) => {
      for (const key of INVESTMENT_FLOW_ORDER) {
        running[key] += deltas[index][key];
      }

      return {
        label: month
          .toLocaleDateString("pt-BR", { month: "short" })
          .replace(".", ""),
        fullLabel: month.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
        ...running,
      };
    });
  }, [months, to, transactions]);

  const keys = useMemo(() => {
    const last = flows[flows.length - 1];
    return last ? INVESTMENT_FLOW_ORDER.filter((key) => last[key] !== 0) : [];
  }, [flows]);

  const isLoading =
    accountsQuery.isLoading ||
    transactionQueries.some((query) => query.isPending);

  const isRefetching =
    accountsQuery.isRefetching ||
    transactionQueries.some((query) => query.isRefetching);

  const refetch = async () => {
    await Promise.all([
      accountsQuery.refetch(),
      ...transactionQueries.map((query) => query.refetch()),
    ]);
  };

  return { flows, keys, isLoading, isRefetching, refetch };
}
