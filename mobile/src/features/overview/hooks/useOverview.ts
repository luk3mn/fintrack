import { useMemo } from "react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import type { Account, AccountKind, Cents } from "@/types/domain";

export type Summary = {
  cash: Cents;
  cardBills: Cents;
  available: Cents;
};

const ORDER: Record<AccountKind, number> = {
  checking: 0,
  savings: 1,
  credit: 2,
};

const sum = (accounts: Account[]) =>
  accounts.reduce((total, account) => total + account.balance, 0);

export function summarize(accounts: Account[]): Summary {
  const cash = sum(accounts.filter((account) => account.kind !== "credit"));
  const cardBills = sum(accounts.filter((account) => account.kind === "credit"));

  return { cash, cardBills, available: cash - cardBills };
}

export function useOverview() {
  const query = useAccounts();

  const accounts = useMemo(
    () =>
      [...(query.data ?? [])].sort(
        (a, b) => ORDER[a.kind] - ORDER[b.kind] || b.balance - a.balance,
      ),
    [query.data],
  );

  const summary = useMemo(() => summarize(accounts), [accounts]);
  console.log("...", accounts);

  return {
    accounts,
    summary,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
