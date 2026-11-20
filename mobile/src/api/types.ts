export type PluggyAccount = {
  id: string;
  itemId: string;
  type: "BANK" | "CREDIT";
  subtype: string;
  name: string;
  marketingName?: string | null;
  number?: string | null;
  balance: number;
  currencyCode: string;
  institution?: string;
};

export type PluggyItem = {
  id: string;
  status: string;
  executionStatus?: string;
  lastUpdatedAt?: string | null;
  connector?: string;
  institution?: string;
};

export type PluggyTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  category?: string | null;
};

export type PluggyInvestment = {
  id: string;
  itemId: string;
  type: string;
  subtype?: string | null;
  name: string;
  issuer?: string | null;
  dueDate?: string | null;
  balance: number;
  amountProfit?: number | null;
  currencyCode: string;
};

export type PluggyPage<T> = {
  total: number;
  totalPages: number;
  page: number;
  results: T[];
};
