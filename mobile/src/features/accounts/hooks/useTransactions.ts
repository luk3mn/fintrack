import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/keys";
import type { PluggyPage, PluggyTransaction } from "@/api/types";
import { toTransaction } from "@/lib/mappers";

const PAGE_SIZE = 100;

type Params = {
  accountId: string;
  from?: string;
  to?: string;
};

export function useTransactions({ accountId, from, to }: Params) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions(accountId, from, to),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      api<PluggyPage<PluggyTransaction>>(endpoints.transactions, {
        query: { accountId, from, to, page: pageParam, pageSize: PAGE_SIZE },
      }),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    select: (data) =>
      data.pages.flatMap((page) => page.results.map(toTransaction)),
  });
}
