import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/keys";
import type { PluggyAccount } from "@/api/types";
import { toAccount } from "@/lib/mappers";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => api<PluggyAccount[]>(endpoints.accounts),
    select: (accounts) => accounts.map(toAccount),
  });
}
