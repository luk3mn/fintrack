import type { Cents, Transaction } from "@/types/domain";
export { categoryLabel } from "./categories";

export type PeriodKey = "current-month" | "previous-month" | "last-3-months";

export type TransactionTypeFilter = "all" | "income" | "expense";

export type TransactionItem = Transaction & {
  institution: string;
  accountName: string;
  categoryLabel: string;
  /** Payment between the user's own bank account and credit card. */
  isInternalTransfer: boolean;
};

/**
 * Pluggy classifies the credit that pays a card invoice as
 * "Credit card payment". That money did not enter the user's wallet — it is
 * the mirror of the invoice debit — so it must not count as income.
 */
export function isInternalCardPayment(
  description?: string | null,
  category?: string | null,
) {
  const text = normalizeText(description ?? "");
  const name = normalizeText(category ?? "");
  const received =
    text.includes("pagamento recebido") || text.includes("payment received");
  const cardPayment =
    name.includes("credit card payment") ||
    name.includes("pagamento de fatura") ||
    text.includes("fatura");

  return received && cardPayment;
}

export type TransactionSection = {
  key: string;
  label: string;
  total: Cents;
  data: TransactionItem[];
};

export type TransactionTotals = {
  income: Cents;
  expenses: Cents;
  balance: Cents;
};

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "current-month", label: "Este mês" },
  { key: "previous-month", label: "Mês passado" },
  { key: "last-3-months", label: "Últimos 3 meses" },
];

export const TYPE_OPTIONS: {
  key: TransactionTypeFilter;
  label: string;
}[] = [
  { key: "all", label: "Todas" },
  { key: "income", label: "Entradas" },
  { key: "expense", label: "Saídas" },
];

const pad = (value: number) => String(value).padStart(2, "0");

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function monthBounds(base: Date, offset: number) {
  const start = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const end = new Date(base.getFullYear(), base.getMonth() + offset + 1, 0);

  return { start: toISODate(start), end: toISODate(end) };
}

export function periodBounds(period: PeriodKey, base: Date = new Date()) {
  if (period === "previous-month") {
    const previous = monthBounds(base, -1);
    return { from: previous.start, to: previous.end };
  }

  if (period === "last-3-months") {
    const first = monthBounds(base, -2);
    return { from: first.start, to: toISODate(base) };
  }

  const current = monthBounds(base, 0);
  return { from: current.start, to: toISODate(base) };
}

export function periodLabel(period: PeriodKey) {
  return PERIOD_OPTIONS.find((option) => option.key === period)?.label ?? "";
}

export function typeLabel(filter: TransactionTypeFilter) {
  return TYPE_OPTIONS.find((option) => option.key === filter)?.label ?? "";
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const DAY_MS = 86_400_000;

/** Shifts a `YYYY-MM-DD` string by a number of days (UTC, DST-safe). */
export function shiftISODate(value: string, days: number) {
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;

  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

const TRANSFER_HINTS = [
  "transferencia",
  "transfer",
  "pix",
  "ted",
  "doc",
  "entre contas",
  "same person",
];

const INVESTMENT_HINTS = [
  "aplicacao",
  "resgate",
  "rdb",
  "cdb",
  "lci",
  "lca",
  "invest",
  "fixed income",
  "mutual fund",
  "automatic investment",
  "proceeds",
  "rendimento",
  "juros",
  "dividendo",
];

const SHORT_HINTS = new Set(["doc", "ted"]);

function includesHint(value: string, hints: string[]) {
  return hints.some((hint) =>
    SHORT_HINTS.has(hint)
      ? new RegExp(`\\b${hint}\\b`).test(value)
      : value.includes(hint),
  );
}

function isTransferLike(
  transaction: Pick<Transaction, "description" | "category">,
) {
  const value = normalizeText(
    `${transaction.description} ${transaction.category ?? ""}`,
  );

  return includesHint(value, TRANSFER_HINTS);
}

function isInvestmentLike(
  transaction: Pick<Transaction, "description" | "category">,
) {
  const value = normalizeText(
    `${transaction.description} ${transaction.category ?? ""}`,
  );

  return includesHint(value, INVESTMENT_HINTS);
}

/** Pluggy can already classify a movement as a transfer between the same person. */
export function isSelfTransferCategory(category?: string | null) {
  const value = normalizeText(category ?? "");

  return (
    value.includes("same person") ||
    value.includes("entre contas") ||
    value.includes("transfer - internal")
  );
}

/**
 * Extracts the counterpart name from a transfer description (e.g.
 * "Transferência enviada pelo Pix|LUCAS RENAN MAUES NUNES" -> the name only).
 * Pluggy's boilerplate and CPF/CNPJ prefixes are real fields in the feed, so
 * this only strips known wrapping — it never invents a name.
 */
function transferCounterpart(description?: string | null) {
  let value = normalizeText(description ?? "");
  if (!value) return "";

  value = value
    .replace(
      /^(?:pix\s+(?:enviado|recebido)|transferencia\s+(?:enviada|recebida)(?:\s+pelo\s+pix)?|transferencia|transfer|ted|doc)\s*(?:\||-|:)?\s*/,
      "",
    )
    .replace(/^(?:cpf|cnpj)\s*:?\s*/, "")
    .replace(/^\d{2,3}\.\d{3}\.\d{3}(?:-\d{2})?\s*/, "")
    .replace(/^[\s\-:;*·|]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  return value;
}

/**
 * Names that Pluggy itself identified as the same person. They let us exclude
 * a self-transfer even when only one leg is connected, the amounts differ by a
 * fee, or the dates are too far apart to pair.
 */
function selfTransferCounterparts(transactions: Transaction[]) {
  const names = new Set<string>();

  for (const transaction of transactions) {
    if (!isSelfTransferCategory(transaction.category)) continue;
    const name = transferCounterpart(transaction.description);
    if (name.length >= 8) names.add(name);
  }

  return names;
}

/**
 * Finds movements that only shuffle money between the user's own accounts, so
 * they must not count as income or expenses.
 *
 * The main rule is a debit in one account paired with a credit of the same
 * amount in a different account of the user, a couple of days apart. This
 * catches the common PJ -> PF monthly transfer even when Pluggy labels both
 * sides only as "Transfers"/"Pix". When Pluggy already says it is a same-person
 * transfer, a small fee/rounding difference is tolerated. Transfers whose
 * counterpart is a name Pluggy already flagged as the same person are also
 * excluded even when the other leg is missing.
 */
export function findInternalTransferIds(
  transactions: Transaction[],
  maxDays = 2,
): Set<string> {
  const internal = new Set<string>();
  const selfCounterparts = selfTransferCounterparts(transactions);

  for (const transaction of transactions) {
    if (isSelfTransferCategory(transaction.category)) {
      internal.add(transaction.id);
      continue;
    }
    if (!isTransferLike(transaction)) continue;

    const counterpart = transferCounterpart(transaction.description);
    if (counterpart && selfCounterparts.has(counterpart)) {
      internal.add(transaction.id);
    }
  }

  const isInternalCandidate = (transaction: Transaction) =>
    !isInvestmentLike(transaction) &&
    !isInternalCardPayment(transaction.description, transaction.category) &&
    (isSelfTransferCategory(transaction.category) ||
      isTransferLike(transaction));

  const debits = transactions
    .filter(
      (transaction) =>
        transaction.amount < 0 && isInternalCandidate(transaction),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const credits = transactions.filter(
    (transaction) => transaction.amount > 0 && isInternalCandidate(transaction),
  );

  const usedCredits = new Set<string>();

  for (const debit of debits) {
    const debitDay = Date.parse(`${debit.date.slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(debitDay)) continue;

    const amount = Math.abs(debit.amount);
    const debitIsSelfTransfer = isSelfTransferCategory(debit.category);
    let match: Transaction | undefined;
    let matchAmountDiff = Number.POSITIVE_INFINITY;
    let matchDistance = Number.POSITIVE_INFINITY;

    for (const credit of credits) {
      if (usedCredits.has(credit.id)) continue;
      if (credit.accountId === debit.accountId) continue;

      const creditDay = Date.parse(`${credit.date.slice(0, 10)}T00:00:00Z`);
      if (Number.isNaN(creditDay)) continue;

      const distance = Math.abs(creditDay - debitDay) / DAY_MS;
      if (distance > maxDays) continue;

      // When Pluggy already labels the movement as "same person transfer", a
      // tiny difference (fees, rounding) is still the same transfer. Generic
      // transfers must match the amount exactly to avoid false positives.
      const tolerance =
        debitIsSelfTransfer || isSelfTransferCategory(credit.category)
          ? Math.max(1, Math.round(amount * 0.02))
          : 0;
      const amountDiff = Math.abs(Math.abs(credit.amount) - amount);
      if (amountDiff > tolerance) continue;

      if (
        amountDiff < matchAmountDiff ||
        (amountDiff === matchAmountDiff && distance < matchDistance)
      ) {
        match = credit;
        matchAmountDiff = amountDiff;
        matchDistance = distance;
      }
    }

    if (match) {
      usedCredits.add(match.id);
      internal.add(debit.id);
      internal.add(match.id);
    }
  }

  return internal;
}

export function summarizeTransactions(
  transactions: TransactionItem[],
): TransactionTotals {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    if (transaction.isInternalTransfer) continue;
    if (transaction.amount > 0) income += transaction.amount;
    else expenses += -transaction.amount;
  }

  return { income, expenses, balance: income - expenses };
}

function dayLabel(date: string, today: Date) {
  const dateKey = date.slice(0, 10);
  if (dateKey === toISODate(today)) return "HOJE";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateKey === toISODate(yesterday)) return "ONTEM";

  const parsed = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateKey;

  return parsed
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "")
    .toUpperCase();
}

export function groupByDay(
  transactions: TransactionItem[],
  today: Date = new Date(),
): TransactionSection[] {
  const groups = new Map<string, TransactionItem[]>();

  for (const transaction of transactions) {
    const key = transaction.date.slice(0, 10);
    const group = groups.get(key);
    if (group) group.push(transaction);
    else groups.set(key, [transaction]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({
      key,
      label: dayLabel(key, today),
      total: data.reduce(
        (sum, item) => sum + (item.isInternalTransfer ? 0 : item.amount),
        0,
      ),
      data,
    }));
}

export type TransactionIconKey =
  | "youtube"
  | "ifood"
  | "uber"
  | "netflix"
  | "spotify"
  | "mercadoPago"
  | "pix"
  | "transfer"
  | "groceries"
  | "restaurant"
  | "car"
  | "home"
  | "invoice"
  | "investment"
  | "income"
  | "yield"
  | "services"
  | "shopping"
  | "receipt";

/** Picks the illustration used in the transaction row. */
export function transactionIconKey(
  transaction: TransactionItem,
): TransactionIconKey {
  if (transaction.isInternalTransfer) return "transfer";

  const value = normalizeText(
    [
      transaction.description,
      transaction.category ?? "",
      transaction.categoryLabel,
    ].join(" "),
  );

  if (value.includes("youtube")) return "youtube";
  if (value.includes("ifood")) return "ifood";
  if (value.includes("uber")) return "uber";
  if (value.includes("netflix")) return "netflix";
  if (value.includes("spotify")) return "spotify";
  if (
    value.includes("mercado pago") ||
    value.includes("mercadopago") ||
    value.includes("mp *")
  ) {
    return "mercadoPago";
  }
  if (value.includes("pix")) return "pix";
  if (value.includes("fatura")) return "invoice";
  if (
    value.includes("rendimento") ||
    value.includes("juros") ||
    value.includes("dividendo") ||
    value.includes("proceeds") ||
    value.includes("interests and dividends")
  ) {
    return "yield";
  }
  if (value.includes("salario") || value.includes("salary")) {
    return "income";
  }
  if (
    value.includes("aplicacao") ||
    value.includes("rdb") ||
    value.includes("cdb") ||
    value.includes("invest") ||
    value.includes("mutual fund")
  ) {
    return "investment";
  }
  if (
    value.includes("supermercad") ||
    value.includes("grocer") ||
    value.includes("mercado")
  ) {
    return "groceries";
  }
  if (
    value.includes("restaurant") ||
    value.includes("bolos e doces") ||
    value.includes("padaria") ||
    value.includes("food and drink")
  ) {
    return "restaurant";
  }
  if (
    value.includes("aluguel") ||
    value.includes("rent") ||
    value.includes("housing")
  ) {
    return "home";
  }
  if (
    value.includes("autopass") ||
    value.includes("transport") ||
    value.includes("carro")
  ) {
    return "car";
  }
  if (
    value.includes("transfer") ||
    value.includes("ted") ||
    value.includes("transferencia")
  ) {
    return "transfer";
  }
  if (
    value.includes("servic") ||
    value.includes("conta de luz") ||
    value.includes("utility")
  ) {
    return "services";
  }
  if (
    value.includes("compra") ||
    value.includes("shopping") ||
    value.includes("compras")
  ) {
    return "shopping";
  }

  return transaction.amount > 0 ? "income" : "receipt";
}
