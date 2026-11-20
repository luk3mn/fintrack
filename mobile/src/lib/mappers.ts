import type {
  PluggyAccount,
  PluggyInvestment,
  PluggyItem,
  PluggyTransaction,
} from "@/api/types";
import type {
  Account,
  AccountKind,
  Connection,
  Investment,
  Transaction,
} from "@/types/domain";
import { toCents } from "./money";

function toKind(account: PluggyAccount): AccountKind {
  if (account.type === "CREDIT") return "credit";
  if (account.subtype === "SAVINGS_ACCOUNT") return "savings";
  return "checking";
}

export function toAccount(account: PluggyAccount): Account {
  return {
    id: account.id,
    itemId: account.itemId,
    institution: account.institution ?? account.marketingName ?? account.name,
    name: account.name,
    subtype: account.subtype || undefined,
    kind: toKind(account),
    number: account.number ?? undefined,
    balance: toCents(account.balance),
    currency: account.currencyCode,
  };
}

export function toTransaction(transaction: PluggyTransaction): Transaction {
  const cents = Math.abs(toCents(transaction.amount));

  return {
    id: transaction.id,
    accountId: transaction.accountId,
    date: transaction.date,
    description: transaction.description,
    amount: transaction.type === "DEBIT" ? -cents : cents,
    category: transaction.category ?? undefined,
  };
}

export function toInvestment(investment: PluggyInvestment): Investment {
  return {
    id: investment.id,
    itemId: investment.itemId,
    name: investment.name,
    type: investment.type,
    issuer: investment.issuer ?? undefined,
    dueDate: investment.dueDate ?? undefined,
    balance: toCents(investment.balance),
    profit:
      investment.amountProfit == null
        ? undefined
        : toCents(investment.amountProfit),
    currency: investment.currencyCode,
  };
}

export function toConnection(item: PluggyItem): Connection {
  return {
    id: item.id,
    status: item.status,
    institution: item.institution ?? undefined,
    lastUpdatedAt: item.lastUpdatedAt ?? undefined,
  };
}
