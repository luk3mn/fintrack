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
import { normalizeText } from "./transactions";

/**
 * Pluggy can report a card-invoice payment as a CREDIT (the card side of the
 * movement). From the user's point of view the money leaves the bank account,
 * so it must always be an expense.
 */
function isCardInvoicePayment(description: string) {
  const value = normalizeText(description);

  return (
    value.includes("pagamento de fatura") ||
    value.includes("pagamento da fatura") ||
    value.includes("pagamento fatura") ||
    value.includes("fatura de cartao") ||
    value.includes("fatura do cartao") ||
    value.includes("pagamento de cartao")
  );
}

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
  const isDebit =
    isCardInvoicePayment(transaction.description) ||
    (transaction.type
      ? transaction.type === "DEBIT"
      : transaction.amount < 0);

  return {
    id: transaction.id,
    accountId: transaction.accountId,
    date: transaction.date,
    description: transaction.description,
    amount: isDebit ? -cents : cents,
    category: transaction.category ?? undefined,
    currency: transaction.currencyCode ?? undefined,
  };
}

export function toInvestment(investment: PluggyInvestment): Investment {
  return {
    id: investment.id,
    itemId: investment.itemId,
    name: investment.name,
    type: investment.type,
    subtype: investment.subtype ?? undefined,
    issuer: investment.issuer ?? undefined,
    institution:
      investment.institution?.name ?? investment.issuer ?? undefined,
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
    personType: item.personType ?? undefined,
    lastUpdatedAt: item.lastUpdatedAt ?? undefined,
  };
}
