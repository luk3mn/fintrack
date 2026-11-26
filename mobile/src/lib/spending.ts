import type { Cents, Transaction } from "@/types/domain";
import { categoryLabel } from "./categories";
import { isInternalCardPayment, normalizeText } from "./transactions";

export type SpendingPeriod = "week" | "month" | "year";

export const SPENDING_PERIODS: { key: SpendingPeriod; label: string }[] = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
];

export type DateBounds = { from: string; to: string };

const pad = (value: number) => String(value).padStart(2, "0");

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** The current week (last 7 days), month or year, up to today. */
export function spendingBounds(
  period: SpendingPeriod,
  base: Date = new Date(),
): DateBounds {
  if (period === "week") {
    const from = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() - 6,
    );
    return { from: toISODate(from), to: toISODate(base) };
  }

  if (period === "year") {
    return { from: `${base.getFullYear()}-01-01`, to: toISODate(base) };
  }

  const from = new Date(base.getFullYear(), base.getMonth(), 1);
  return { from: toISODate(from), to: toISODate(base) };
}

function shortDate(iso: string) {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
}

export function spendingRangeLabel({ from, to }: DateBounds) {
  return `${shortDate(from)} – ${shortDate(to)}`;
}

/**
 * Pluggy descriptions for card purchases and Pix/transfers usually wrap the
 * merchant name in boilerplate. Strip only those known prefixes so the same
 * establishment groups together without inventing a name.
 */
const NAME_PREFIXES = [
  /^(?:pix\s+)?(?:enviado|enviada|realizado|realizada|feito|feita)\s+(?:para|em|a)?\s*/i,
  /^(?:transfer[eê]ncia|transfer|ted|doc)\s+(?:enviada|enviado|realizada|realizado|para|em)?\s*/i,
  /^(?:compra|pagamento)\s+(?:no|na|de)?\s*(?:d[eé]bito|cr[eé]dito|cart[aã]o)?\s*(?:na|no|em|para)?\s*/i,
];

export function establishmentName(description?: string | null) {
  let value = (description ?? "").replace(/\s+/g, " ").trim();
  if (!value) return "";

  for (const prefix of NAME_PREFIXES) {
    const next = value.replace(prefix, "");
    if (next !== value) {
      value = next;
      break;
    }
  }

  return value.replace(/^[\s\-:;*·|]+/, "").trim();
}

export type EstablishmentSpending = {
  key: string;
  name: string;
  total: Cents;
  count: number;
  category: string;
  lastDate: string;
  share: number;
};

export type SpendingSummary = {
  total: Cents;
  count: number;
  rows: EstablishmentSpending[];
};

type Group = {
  name: string;
  total: Cents;
  count: number;
  categories: Map<string, number>;
  lastDate: string;
};

/**
 * Sums real debits by establishment, sorted from the largest to the smallest.
 * Internal transfers and card-invoice mirrors are excluded, so the total
 * matches the expenses shown elsewhere in the app.
 */
export function summarizeSpendingByEstablishment(
  transactions: Transaction[],
  internalIds: Set<string>,
  bounds: DateBounds,
): SpendingSummary {
  const groups = new Map<string, Group>();

  for (const transaction of transactions) {
    const date = transaction.date.slice(0, 10);
    if (transaction.amount >= 0) continue;
    if (date < bounds.from || date > bounds.to) continue;
    if (internalIds.has(transaction.id)) continue;
    if (isInternalCardPayment(transaction.description, transaction.category)) {
      continue;
    }

    const category = transaction.category?.trim()
      ? categoryLabel(transaction.category)
      : "Outros";
    const name = establishmentName(transaction.description) || category;
    const key = normalizeText(name) || "outros";

    const group = groups.get(key) ?? {
      name,
      total: 0,
      count: 0,
      categories: new Map<string, number>(),
      lastDate: date,
    };

    group.total += Math.abs(transaction.amount);
    group.count += 1;
    group.categories.set(category, (group.categories.get(category) ?? 0) + 1);
    if (date > group.lastDate) group.lastDate = date;
    groups.set(key, group);
  }

  const rows = [...groups.entries()]
    .map(([key, group]) => ({
      key,
      name: group.name,
      total: group.total,
      count: group.count,
      category:
        [...group.categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "Outros",
      lastDate: group.lastDate,
      share: 0,
    }))
    .sort((a, b) => b.total - a.total);

  const total = rows.reduce((sum, row) => sum + row.total, 0);
  for (const row of rows) {
    row.share = total > 0 ? row.total / total : 0;
  }

  return { total, count: rows.length, rows };
}
