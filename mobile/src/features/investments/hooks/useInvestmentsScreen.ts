import { useMemo, useState } from "react";
import { useItems } from "@/features/accounts/hooks/useItems";
import {
  investmentCategory,
  summarizeInvestments,
  type InvestmentFilter,
} from "@/lib/investments";
import { useInvestments } from "./useInvestments";

const updatedAt = (value?: string) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export function useInvestmentsScreen() {
  const investmentsQuery = useInvestments();
  const itemsQuery = useItems();
  const [filter, setFilter] = useState<InvestmentFilter>("all");

  const investments = useMemo(
    () =>
      [...(investmentsQuery.data ?? [])]
        .filter((investment) => investment.balance > 0)
        .sort((a, b) => b.balance - a.balance),
    [investmentsQuery.data],
  );

  const summary = useMemo(() => summarizeInvestments(investments), [investments]);

  const visibleInvestments = useMemo(
    () =>
      filter === "all"
        ? investments
        : investments.filter(
            (investment) => investmentCategory(investment) === filter,
          ),
    [investments, filter],
  );

  const lastSync = useMemo(() => {
    const stamps = (itemsQuery.data ?? [])
      .map((item) => updatedAt(item.lastUpdatedAt))
      .filter((stamp) => stamp > 0);

    return stamps.length ? new Date(Math.max(...stamps)) : undefined;
  }, [itemsQuery.data]);

  const isRefetching =
    investmentsQuery.isRefetching || itemsQuery.isRefetching;

  const refetch = async () => {
    await Promise.all([investmentsQuery.refetch(), itemsQuery.refetch()]);
  };

  return {
    investments,
    visibleInvestments,
    summary,
    filter,
    setFilter,
    lastSync,
    isLoading: investmentsQuery.isLoading,
    isError: investmentsQuery.isError,
    isSyncLoading: itemsQuery.isLoading,
    isRefetching,
    refetch,
  };
}
