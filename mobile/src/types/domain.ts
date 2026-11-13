export type Cents = number;

export type AccountKind = "checking" | "savings" | "credit";

export type Account = {
  id: string;
  itemId: string;
  institution: string;
  kind: AccountKind;
  number?: string;
  balance: Cents;
  currency: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: Cents;
  category?: string;
};

export type Investment = {
  id: string;
  itemId: string;
  name: string;
  type: string;
  issuer?: string;
  dueDate?: string;
  balance: Cents;
  profit?: Cents;
  currency: string;
};

export type Connection = {
  id: string;
  status: string;
  lastUpdatedAt?: string;
};
