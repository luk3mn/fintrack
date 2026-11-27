import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { queryKeys } from "@/api/keys";
import { fetchPeriodTransactions } from "@/api/transactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useItems } from "@/features/accounts/hooks/useItems";
import { categoryLabel } from "@/lib/categories";
import { withDisplayNames } from "@/lib/connections";
import {
  findInternalTransferIds,
  isInternalCardPayment,
  shiftISODate,
} from "@/lib/transactions";
import type { CashFlowPoint } from "@/lib/spending";
import { summarizeAccounts } from "@/lib/summary";
import type { AccountKind, Cents, Transaction } from "@/types/domain";

export type CategoryTotal = {
  name: string;
  amount: Cents;
  share: number;
};

export type OverviewFlows = {
  income: Cents;
  expenses: Cents;
  savingsRate?: number;
  /** Exactly the positive transactions summed into `income`. */
  incomeTransactions: Transaction[];
};

const ORDER: Record<AccountKind, number> = {
  checking: 0,
  savings: 1,
  credit: 2,
};

const MONTHS_BACK = 36;
const FLOW_BUCKETS = 7;
const SPARKLINE_MONTHS = 6;

const pad = (value: number) => String(value).padStart(2, "0");

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function boundsFor(base: Date, offset: number) {
  const start = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const end = new Date(base.getFullYear(), base.getMonth() + offset + 1, 0);

  return {
    startISO: isoDate(start),
    endISO: isoDate(end),
    days: end.getDate(),
    month: start,
  };
}

function totals(
  transactions: Transaction[],
  internalIds: Set<string>,
): OverviewFlows {
  let income = 0;
  let expenses = 0;
  const incomeTransactions: Transaction[] = [];

  for (const transaction of transactions) {
    if (
      internalIds.has(transaction.id) ||
      isInternalCardPayment(transaction.description, transaction.category)
    ) {
      continue;
    }
    if (transaction.amount > 0) {
      income += transaction.amount;
      incomeTransactions.push(transaction);
    } else {
      expenses += -transaction.amount;
    }
  }

  return {
    income,
    expenses,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : undefined,
    incomeTransactions,
  };
}

function percentChange(current: number, previous: number) {
  if (previous <= 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export function useOverview() {
  const accountsQuery = useAccounts();
  const itemsQuery = useItems();
  const [today] = useState(() => new Date());
  const [monthOffset, setMonthOffset] = useState(0);

  const todayISO = isoDate(today);
  const current = boundsFor(today, monthOffset);
  const previous = boundsFor(today, monthOffset - 1);

  const accounts = useMemo(
    () =>
      [...(accountsQuery.data ?? [])].sort(
        (a, b) => ORDER[a.kind] - ORDER[b.kind] || b.balance - a.balance,
      ),
    [accountsQuery.data],
  );

  const summary = useMemo(() => summarizeAccounts(accounts), [accounts]);

  const connections = useMemo(
    () => withDisplayNames(itemsQuery.data ?? []),
    [itemsQuery.data],
  );

  const cashAccounts = useMemo(
    () => accounts.filter((account) => account.kind !== "credit"),
    [accounts],
  );

  // Fetch enough real months for the KPI sparklines. A small buffer before the
  // window lets transfers crossing its first day find their pair; the month
  // filters below still ignore anything outside their bounds.
  const sparklineStart = boundsFor(today, monthOffset - SPARKLINE_MONTHS + 1);
  const from = shiftISODate(sparklineStart.startISO, -3);
  const to = monthOffset === 0 ? todayISO : current.endISO;

  const periodQueries = useQueries({
    queries: cashAccounts.map((account) => ({
      queryKey: queryKeys.periodTransactions(account.id, from, to),
      queryFn: () => fetchPeriodTransactions(account.id, from, to),
      staleTime: 5 * 60_000,
    })),
  });

  const transactions = useMemo(
    () => periodQueries.flatMap((query) => query.data ?? []),
    [periodQueries],
  );

  const currentEnd = monthOffset === 0 ? todayISO : current.endISO;
  const chartEndDay = monthOffset === 0 ? today.getDate() : current.days;
  const monthShort = current.month
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");

  const derived = useMemo(() => {
    const currentTransactions = transactions.filter(
      (transaction) =>
        transaction.date >= current.startISO && transaction.date <= currentEnd,
    );
    const previousTransactions = transactions.filter(
      (transaction) =>
        transaction.date >= previous.startISO &&
        transaction.date <= previous.endISO,
    );

    const internalIds = findInternalTransferIds(transactions);
    const currentTotals = totals(currentTransactions, internalIds);
    const previousTotals = totals(previousTransactions, internalIds);

    const history = Array.from({ length: SPARKLINE_MONTHS }, (_, index) => {
      const offset = monthOffset - SPARKLINE_MONTHS + 1 + index;
      const monthBounds = boundsFor(today, offset);
      const endISO = offset === 0 ? todayISO : monthBounds.endISO;
      const monthTransactions = transactions.filter(
        (transaction) =>
          transaction.date >= monthBounds.startISO &&
          transaction.date <= endISO,
      );
      return totals(monthTransactions, internalIds);
    });
    const sparklines = {
      income: history.map((month) => month.income),
      expenses: history.map((month) => month.expenses),
      savings: history.map((month) => month.savingsRate ?? 0),
    };

    const bucketOf = (date: string) => {
      const day = Number(date.slice(8, 10));
      return Math.min(
        FLOW_BUCKETS - 1,
        Math.max(0, Math.ceil((day * FLOW_BUCKETS) / chartEndDay) - 1),
      );
    };

    const buckets = Array.from({ length: FLOW_BUCKETS }, (_, index) => ({
      fromDay: Math.floor((index * chartEndDay) / FLOW_BUCKETS) + 1,
      toDay: Math.floor(((index + 1) * chartEndDay) / FLOW_BUCKETS),
      income: 0,
      expenses: 0,
    }));
    const categoryTotals = new Map<string, Cents>();

    for (const transaction of currentTransactions) {
      if (
        internalIds.has(transaction.id) ||
        isInternalCardPayment(transaction.description, transaction.category)
      ) {
        continue;
      }

      const amount = Math.abs(transaction.amount);
      if (amount === 0) continue;

      const bucket = buckets[bucketOf(transaction.date)];
      if (transaction.amount > 0) {
        bucket.income += amount;
        continue;
      }

      bucket.expenses += amount;

      const raw = transaction.category?.trim();
      const name = raw ? categoryLabel(raw) : "Outros";
      categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + amount);
    }

    const categories: CategoryTotal[] = [...categoryTotals.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        share: currentTotals.expenses > 0 ? amount / currentTotals.expenses : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const flow: CashFlowPoint[] = buckets.map(
      ({ fromDay, toDay, income, expenses }) => ({
        label: pad(fromDay),
        rangeLabel: `${pad(fromDay)}–${pad(toDay)} ${monthShort}`,
        income,
        expenses,
      }),
    );

    return {
      currentTotals,
      flow,
      sparklines,
      currentBucket: monthOffset === 0 ? bucketOf(todayISO) : -1,
      categories,
      incomeDelta: percentChange(currentTotals.income, previousTotals.income),
      expensesDelta: percentChange(
        currentTotals.expenses,
        previousTotals.expenses,
      ),
      savingsDelta:
        currentTotals.savingsRate !== undefined &&
        previousTotals.savingsRate !== undefined
          ? currentTotals.savingsRate - previousTotals.savingsRate
          : undefined,
    };
  }, [
    transactions,
    current.startISO,
    currentEnd,
    chartEndDay,
    monthShort,
    previous.startISO,
    previous.endISO,
    monthOffset,
    today,
    todayISO,
  ]);

  const lastSync = useMemo(() => {
    const stamps = (itemsQuery.data ?? [])
      .map((item) =>
        item.lastUpdatedAt ? new Date(item.lastUpdatedAt).getTime() : NaN,
      )
      .filter(Number.isFinite);

    return stamps.length ? new Date(Math.max(...stamps)) : undefined;
  }, [itemsQuery.data]);

  const isRefetching =
    accountsQuery.isRefetching ||
    itemsQuery.isRefetching ||
    periodQueries.some((query) => query.isRefetching);

  const refetch = async () => {
    await Promise.all([
      accountsQuery.refetch(),
      itemsQuery.refetch(),
      ...periodQueries.map((query) => query.refetch()),
    ]);
  };

  const monthLabel = `${current.month
    .toLocaleDateString("pt-BR", { month: "long" })
    .toUpperCase()} ${current.month.getFullYear()}`;

  return {
    accounts,
    connections,
    summary,
    monthLabel,
    canGoNext: monthOffset < 0,
    canGoPrev: monthOffset > -MONTHS_BACK,
    isCurrentMonth: monthOffset === 0,
    goToPreviousMonth: () =>
      setMonthOffset((offset) => Math.max(offset - 1, -MONTHS_BACK)),
    goToNextMonth: () => setMonthOffset((offset) => Math.min(offset + 1, 0)),
    income: derived.currentTotals.income,
    incomeTransactions: derived.currentTotals.incomeTransactions,
    expenses: derived.currentTotals.expenses,
    savingsRate: derived.currentTotals.savingsRate,
    incomeDelta: derived.incomeDelta,
    expensesDelta: derived.expensesDelta,
    savingsDelta: derived.savingsDelta,
    flow: derived.flow,
    sparklines: derived.sparklines,
    currentBucket: derived.currentBucket,
    categories: derived.categories,
    lastDay: current.days,
    lastSync,
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    isRefetching,
    isTransactionsLoading: periodQueries.some((query) => query.isPending),
    refetch,
  };
}
