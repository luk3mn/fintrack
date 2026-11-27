import type { Cents, Transaction } from "@/types/domain";
import { categoryLabel } from "./categories";
import {
  categoryForEstablishment,
  type SpendingCategoryRule,
} from "./spendingRules";
import { isInternalCardPayment, normalizeText } from "./transactions";

export type SpendingPeriod = "week" | "month" | "year";

export const SPENDING_PERIODS: { key: SpendingPeriod; label: string }[] = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
];

/** Months of the current year, selectable under the "Mês" filter. */
export const SPENDING_MONTHS: {
  index: number;
  label: string;
  fullLabel: string;
}[] = [
  { index: 0, label: "Jan", fullLabel: "Janeiro" },
  { index: 1, label: "Fev", fullLabel: "Fevereiro" },
  { index: 2, label: "Mar", fullLabel: "Março" },
  { index: 3, label: "Abr", fullLabel: "Abril" },
  { index: 4, label: "Mai", fullLabel: "Maio" },
  { index: 5, label: "Jun", fullLabel: "Junho" },
  { index: 6, label: "Jul", fullLabel: "Julho" },
  { index: 7, label: "Ago", fullLabel: "Agosto" },
  { index: 8, label: "Set", fullLabel: "Setembro" },
  { index: 9, label: "Out", fullLabel: "Outubro" },
  { index: 10, label: "Nov", fullLabel: "Novembro" },
  { index: 11, label: "Dez", fullLabel: "Dezembro" },
];

export type SpendingGrouping = "establishment" | "category";

export const SPENDING_GROUPINGS: {
  key: SpendingGrouping;
  label: string;
}[] = [
  { key: "establishment", label: "Estabelecimentos" },
  { key: "category", label: "Categorias" },
];

export type DateBounds = { from: string; to: string };

const pad = (value: number) => String(value).padStart(2, "0");

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** The current week (last 7 days), a chosen month, or the year up to today. */
export function spendingBounds(
  period: SpendingPeriod,
  base: Date = new Date(),
  month: number = base.getMonth(),
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

  const target = Math.min(11, Math.max(0, month));
  const from = new Date(base.getFullYear(), target, 1);
  const to = new Date(base.getFullYear(), target + 1, 0);
  return { from: toISODate(from), to: toISODate(to) };
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

export type SpendingRow = {
  key: string;
  name: string;
  total: Cents;
  count: number;
  category: string;
  /** True when the category came from a user-defined rule. */
  customCategory: boolean;
  lastDate: string;
  share: number;
};

export type SpendingSummary = {
  total: Cents;
  count: number;
  rows: SpendingRow[];
};

type Group = {
  name: string;
  total: Cents;
  count: number;
  categories: Map<string, number>;
  customCategory: boolean;
  lastDate: string;
};

type SpendingEntry = {
  date: string;
  amount: Cents;
  establishment: string;
  category: string;
  customCategory: boolean;
};

/** Real debits in the period, already normalized and free of internal money moves. */
function spendingEntries(
  transactions: Transaction[],
  internalIds: Set<string>,
  bounds: DateBounds,
  rules: SpendingCategoryRule[],
): SpendingEntry[] {
  const entries: SpendingEntry[] = [];

  for (const transaction of transactions) {
    const date = transaction.date.slice(0, 10);
    if (transaction.amount >= 0) continue;
    if (date < bounds.from || date > bounds.to) continue;
    if (internalIds.has(transaction.id)) continue;
    if (isInternalCardPayment(transaction.description, transaction.category)) {
      continue;
    }

    const establishment =
      establishmentName(transaction.description) ||
      (transaction.category?.trim()
        ? categoryLabel(transaction.category)
        : "Outros");
    const ruleCategory = categoryForEstablishment(establishment, rules);
    const category =
      ruleCategory ??
      (transaction.category?.trim()
        ? categoryLabel(transaction.category)
        : "Outros");

    entries.push({
      date,
      amount: Math.abs(transaction.amount),
      establishment,
      category,
      customCategory: Boolean(ruleCategory),
    });
  }

  return entries;
}

/** Categories actually present in the period, sorted for the filter sheet. */
export function spendingCategories(
  transactions: Transaction[],
  internalIds: Set<string>,
  bounds: DateBounds,
  rules: SpendingCategoryRule[] = [],
): string[] {
  const categories = new Set(
    spendingEntries(transactions, internalIds, bounds, rules).map(
      (entry) => entry.category,
    ),
  );

  return [...categories].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Sums real debits by establishment or category, sorted from the largest to
 * the smallest. Internal transfers and card-invoice mirrors are excluded, so
 * the total matches the expenses shown elsewhere in the app.
 */
export function summarizeSpending(
  transactions: Transaction[],
  internalIds: Set<string>,
  bounds: DateBounds,
  grouping: SpendingGrouping = "establishment",
  rules: SpendingCategoryRule[] = [],
  categoryFilter?: string | null,
): SpendingSummary {
  const groups = new Map<string, Group>();

  for (const entry of spendingEntries(
    transactions,
    internalIds,
    bounds,
    rules,
  )) {
    if (categoryFilter && entry.category !== categoryFilter) continue;

    const name = grouping === "category" ? entry.category : entry.establishment;
    const key = normalizeText(name) || "outros";

    const group = groups.get(key) ?? {
      name,
      total: 0,
      count: 0,
      categories: new Map<string, number>(),
      customCategory: entry.customCategory,
      lastDate: entry.date,
    };

    group.total += entry.amount;
    group.count += 1;
    group.categories.set(
      entry.category,
      (group.categories.get(entry.category) ?? 0) + 1,
    );
    if (entry.date > group.lastDate) group.lastDate = entry.date;
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
      customCategory: group.customCategory,
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
