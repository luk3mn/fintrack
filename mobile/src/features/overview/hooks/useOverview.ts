import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { queryKeys } from "@/api/keys";
import { fetchPeriodTransactions } from "@/api/transactions";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useItems } from "@/features/accounts/hooks/useItems";
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
};

const ORDER: Record<AccountKind, number> = {
  checking: 0,
  savings: 1,
  credit: 2,
};

const MONTHS_BACK = 36;

const CATEGORY_LABELS: Record<string, string> = {
  groceries: "Mercado",
  supermarket: "Mercado",
  restaurants: "Restaurantes",
  "food and drink": "Alimentação",
  food: "Alimentação",
  housing: "Moradia",
  rent: "Moradia",
  transportation: "Transporte",
  transport: "Transporte",
  healthcare: "Saúde",
  health: "Saúde",
  education: "Educação",
  entertainment: "Lazer",
  shopping: "Compras",
  services: "Serviços",
  utilities: "Contas",
  travel: "Viagens",
  taxes: "Impostos",
  insurance: "Seguros",
  investments: "Investimentos",
  transfers: "Transferências",
  salary: "Salário",
  income: "Receitas",
  other: "Outros",
};

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

function totals(transactions: Transaction[]): OverviewFlows {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    if (transaction.amount > 0) income += transaction.amount;
    else expenses += -transaction.amount;
  }

  return {
    income,
    expenses,
    savingsRate:
      income > 0 ? ((income - expenses) / income) * 100 : undefined,
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

  const cashAccounts = useMemo(
    () => accounts.filter((account) => account.kind !== "credit"),
    [accounts],
  );

  const from = previous.startISO;
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

  const derived = useMemo(() => {
    const currentTransactions = transactions.filter(
      (transaction) =>
        transaction.date >= current.startISO &&
        transaction.date <= currentEnd,
    );
    const previousTransactions = transactions.filter(
      (transaction) =>
        transaction.date >= previous.startISO &&
        transaction.date <= previous.endISO,
    );

    const currentTotals = totals(currentTransactions);
    const previousTotals = totals(previousTransactions);

    const bucketOf = (date: string) => {
      const day = Number(date.slice(8, 10));
      return Math.min(6, Math.floor(((day - 1) / chartEndDay) * 7));
    };

    const weekly: Cents[] = Array.from({ length: 7 }, () => 0);
    const categoryTotals = new Map<string, Cents>();

    for (const transaction of currentTransactions) {
      if (transaction.amount >= 0) continue;

      const amount = -transaction.amount;
      weekly[bucketOf(transaction.date)] += amount;

      const raw = transaction.category?.trim();
      const name = raw
        ? (CATEGORY_LABELS[raw.toLowerCase()] ?? raw)
        : "Outros";
      categoryTotals.set(name, (categoryTotals.get(name) ?? 0) + amount);
    }

    const categories: CategoryTotal[] = [...categoryTotals.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        share:
          currentTotals.expenses > 0 ? amount / currentTotals.expenses : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return {
      currentTotals,
      weekly,
      currentBucket:
        monthOffset === 0 ? bucketOf(todayISO) : -1,
      categories,
      incomeDelta: percentChange(
        currentTotals.income,
        previousTotals.income,
      ),
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
    previous.startISO,
    previous.endISO,
    monthOffset,
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
    summary,
    monthLabel,
    canGoNext: monthOffset < 0,
    canGoPrev: monthOffset > -MONTHS_BACK,
    isCurrentMonth: monthOffset === 0,
    goToPreviousMonth: () =>
      setMonthOffset((offset) => Math.max(offset - 1, -MONTHS_BACK)),
    goToNextMonth: () =>
      setMonthOffset((offset) => Math.min(offset + 1, 0)),
    income: derived.currentTotals.income,
    expenses: derived.currentTotals.expenses,
    savingsRate: derived.currentTotals.savingsRate,
    incomeDelta: derived.incomeDelta,
    expensesDelta: derived.expensesDelta,
    savingsDelta: derived.savingsDelta,
    weekly: derived.weekly,
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
