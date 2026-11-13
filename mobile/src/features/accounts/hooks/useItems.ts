import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/keys";
import type { PluggyItem } from "@/api/types";
import { toConnection } from "@/lib/mappers";

export function useItems() {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: () => api<PluggyItem[]>(endpoints.items),
    select: (items) => items.map(toConnection),
  });
}
