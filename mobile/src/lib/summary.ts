import type { Account, Cents } from "@/types/domain";

export type Summary = {
  cash: Cents;
  cardBills: Cents;
  available: Cents;
};

const sum = (accounts: Account[]) =>
  accounts.reduce((total, account) => total + account.balance, 0);

export function summarizeAccounts(accounts: Account[]): Summary {
  const cash = sum(accounts.filter((account) => account.kind !== "credit"));
  const cardBills = sum(accounts.filter((account) => account.kind === "credit"));

  return { cash, cardBills, available: cash - cardBills };
}
