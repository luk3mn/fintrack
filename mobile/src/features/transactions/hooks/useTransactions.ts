import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "@/api/keys";
import { fetchPeriodTransactions } from "@/api/transactions";

type Params = {
  accountIds: string[];
  from: string;
  to: string;
};

/** Loads real transactions for every connected account in one date interval. */
export function useTransactions({ accountIds, from, to }: Params) {
  const queries = useQueries({
    queries: accountIds.map((accountId) => ({
      queryKey: queryKeys.periodTransactions(accountId, from, to),
      queryFn: () => fetchPeriodTransactions(accountId, from, to),
      staleTime: 5 * 60_000,
    })),
  });

  const transactions = useMemo(
    () => queries.flatMap((query) => query.data ?? []),
    [queries],
  );

  const isLoading = queries.some((query) => query.isPending);
  const isError = queries.length > 0 && queries.some((query) => query.isError);
  const isRefetching = queries.some((query) => query.isRefetching);

  const refetch = async () => {
    await Promise.all(queries.map((query) => query.refetch()));
  };

  return { transactions, isLoading, isError, isRefetching, refetch };
}
