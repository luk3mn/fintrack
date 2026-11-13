import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { endpoints } from "@/api/endpoints";

type RefreshResult = {
  id: string;
  status: string;
};

export function useRefreshItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      api<RefreshResult>(endpoints.refresh(itemId), { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
