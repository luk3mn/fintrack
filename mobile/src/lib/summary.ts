import { institutionKey } from "@/lib/institutions";
import type { Account, AccountKind, Cents, Connection } from "@/types/domain";

export type Summary = {
  cash: Cents;
  cardBills: Cents;
  available: Cents;
};

const sum = (accounts: Account[]) =>
  accounts.reduce((total, account) => total + account.balance, 0);

export function summarizeAccounts(accounts: Account[]): Summary {
  const cash = sum(accounts.filter((account) => account.kind !== "credit"));
  const cardBills = sum(
    accounts.filter((account) => account.kind === "credit"),
  );

  return { cash, cardBills, available: cash - cardBills };
}

const KIND_LABELS: Record<AccountKind, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit: "Cartão de crédito",
};

const SUBTYPE_LABELS: Record<string, string> = {
  CHECKING_ACCOUNT: "Conta corrente",
  SAVINGS_ACCOUNT: "Poupança",
  PAYMENT_ACCOUNT: "Conta de pagamento",
  CREDIT_CARD: "Cartão de crédito",
};

const KIND_ORDER: Record<AccountKind, number> = {
  checking: 0,
  savings: 1,
  credit: 2,
};

export type AccountBalanceItem = {
  id: string;
  label: string;
  kind: AccountKind;
  /** Card balances are negative so they read as a bill, not an asset. */
  balance: Cents;
};

export type InstitutionBalance = {
  key: string;
  label: string;
  logo: string;
  cash: Cents;
  cardBills: Cents;
  accounts: AccountBalanceItem[];
};

function accountLabel(account: Account) {
  const kind = account.subtype
    ? (SUBTYPE_LABELS[account.subtype] ?? KIND_LABELS[account.kind])
    : KIND_LABELS[account.kind];
  const digits = account.number?.replace(/\D/g, "");
  const suffix =
    digits && digits.length >= 4 ? ` · •• ${digits.slice(-4)}` : "";

  return `${kind}${suffix}`;
}

/**
 * Groups every connected account by institution. Two connections to the same
 * bank stay separate when `connections` carries PF/PJ display names, so each
 * one can show its own available balance.
 */
export function groupAccountsByInstitution(
  accounts: Account[],
  connections: Connection[] = [],
): InstitutionBalance[] {
  const connectionById = new Map(connections.map((item) => [item.id, item]));
  const groups = new Map<string, InstitutionBalance>();

  for (const account of accounts) {
    const connection = connectionById.get(account.itemId);
    const label =
      connection?.displayName ?? connection?.institution ?? account.institution;
    const knownKey = institutionKey(label);
    // The connection id keeps Nubank PF and Nubank PJ as separate rows.
    const key = connection
      ? `item:${connection.id}`
      : `${knownKey ?? "other"}:${label.trim().toLowerCase()}`;

    const group = groups.get(key) ?? {
      key,
      label,
      logo: knownKey ?? label,
      cash: 0,
      cardBills: 0,
      accounts: [],
    };

    if (account.kind === "credit") {
      group.cardBills += Math.abs(account.balance);
      group.accounts.push({
        id: account.id,
        label: accountLabel(account),
        kind: account.kind,
        balance: -Math.abs(account.balance),
      });
    } else {
      group.cash += account.balance;
      group.accounts.push({
        id: account.id,
        label: accountLabel(account),
        kind: account.kind,
        balance: account.balance,
      });
    }

    groups.set(key, group);
  }

  const rows = [...groups.values()];
  for (const row of rows) {
    row.accounts.sort(
      (a, b) =>
        KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || b.balance - a.balance,
    );
  }

  return rows.sort((a, b) => b.cash - a.cash || a.label.localeCompare(b.label));
}
