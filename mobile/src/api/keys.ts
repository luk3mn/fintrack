export const queryKeys = {
  items: ["items"] as const,
  accounts: ["accounts"] as const,
  investments: ["investments"] as const,
  transactions: (accountId: string, from?: string, to?: string) =>
    ["transactions", accountId, from, to] as const,
  periodTransactions: (accountId: string, from?: string, to?: string) =>
    ["period-transactions", accountId, from, to] as const,
};
