import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/keys";
import type { PluggyInvestment } from "@/api/types";
import { toInvestment } from "@/lib/mappers";

export function useInvestments() {
  return useQuery({
    queryKey: queryKeys.investments,
    queryFn: () => api<PluggyInvestment[]>(endpoints.investments),
    select: (investments) => investments.map(toInvestment),
  });
}
