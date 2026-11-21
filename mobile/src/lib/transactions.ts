import type { Cents, Transaction } from "@/types/domain";

export type PeriodKey =
  | "current-month"
  | "previous-month"
  | "last-3-months";

export type TransactionTypeFilter = "all" | "income" | "expense";

export type TransactionItem = Transaction & {
  institution: string;
  accountName: string;
  categoryLabel: string;
};

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

const CATEGORY_LABELS: Record<string, string> = {
  groceries: "Mercado",
  supermarket: "Mercado",
  restaurants: "Restaurantes",
  "food and drink": "Alimentação",
  food: "Alimentação",
  housing: "Moradia",
  rent: "Moradia",
  transportation: "Transporte",
  transport: "Transporte",
  healthcare: "Saúde",
  health: "Saúde",
  education: "Educação",
  entertainment: "Lazer",
  shopping: "Compras",
  services: "Serviços",
  utilities: "Contas",
  travel: "Viagens",
  taxes: "Impostos",
  insurance: "Seguros",
  investments: "Investimentos",
  transfers: "Transferências",
  salary: "Salário",
  income: "Receitas",
  other: "Outros",
};

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

export function categoryLabel(category?: string) {
  const raw = category?.trim();
  if (!raw) return "Transação";
  return CATEGORY_LABELS[raw.toLowerCase()] ?? raw;
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function summarizeTransactions(
  transactions: TransactionItem[],
): TransactionTotals {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
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
      total: data.reduce((sum, item) => sum + item.amount, 0),
      data,
    }));
}

export function transactionIconName(transaction: TransactionItem) {
  if (transaction.amount > 0) return "arrow-down-outline" as const;

  const value = normalizeText(
    `${transaction.category ?? ""} ${transaction.description}`,
  );

  if (value.includes("supermercad") || value.includes("grocer")) {
    return "cart-outline" as const;
  }
  if (value.includes("restaurant") || value.includes("ifood")) {
    return "restaurant-outline" as const;
  }
  if (value.includes("uber") || value.includes("transport")) {
    return "car-outline" as const;
  }
  if (value.includes("aluguel") || value.includes("rent") || value.includes("housing")) {
    return "home-outline" as const;
  }
  if (value.includes("transfer") || value.includes("pix") || value.includes("ted")) {
    return "swap-horizontal-outline" as const;
  }

  return "receipt-outline" as const;
}
