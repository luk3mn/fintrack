import { maturityDateLabel } from "@/lib/dates";
import type { Cents, Investment } from "@/types/domain";

export type InvestmentCategory = "fixed" | "funds" | "equity";
export type InvestmentFilter = "all" | InvestmentCategory;

export const CATEGORY_LABELS: Record<InvestmentCategory, string> = {
  fixed: "Renda fixa",
  funds: "Fundos",
  equity: "Ações",
};

export const CATEGORY_ORDER: InvestmentCategory[] = [
  "fixed",
  "funds",
  "equity",
];

export function investmentCategory(
  investment: Investment,
): InvestmentCategory {
  switch (investment.type) {
    case "MUTUAL_FUND":
      return "funds";
    case "EQUITY":
    case "ETF":
      return "equity";
    default:
      return "fixed";
  }
}

export type InvestmentAllocation = {
  category: InvestmentCategory;
  label: string;
  balance: Cents;
  share: number;
  barRatio: number;
};

export function shortInvestmentName(name: string) {
  const parts = name
    .split(/\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const issuer = parts[1].split(/\s+/).slice(0, 2).join(" ");
    return issuer ? `${parts[0]} ${issuer}` : parts[0];
  }

  return name.length > 28 ? `${name.slice(0, 27)}…` : name;
}

export function shortInstitutionName(name: string) {
  const primary = name.split(/\s+-\s+/)[0].trim();
  return primary.split(/\s+/).slice(0, 2).join(" ");
}

export type InvestmentMaturity = {
  id: string;
  date: Date;
  dateLabel: string;
  name: string;
  balance: Cents;
};

export type InvestmentSummary = {
  total: Cents;
  profit: Cents;
  allocations: InvestmentAllocation[];
  maturities: InvestmentMaturity[];
};

export function summarizeInvestments(
  investments: Investment[],
): InvestmentSummary {
  const total = investments.reduce((sum, item) => sum + item.balance, 0);
  const profit = investments.reduce(
    (sum, item) => sum + (item.profit ?? 0),
    0,
  );

  const balances = new Map<InvestmentCategory, Cents>(
    CATEGORY_ORDER.map((category) => [category, 0]),
  );

  for (const investment of investments) {
    const category = investmentCategory(investment);
    balances.set(category, (balances.get(category) ?? 0) + investment.balance);
  }

  const largest = Math.max(...balances.values(), 0);
  const allocations = CATEGORY_ORDER.map((category) => {
    const balance = balances.get(category) ?? 0;
    return {
      category,
      label: CATEGORY_LABELS[category],
      balance,
      share: total > 0 ? balance / total : 0,
      barRatio: largest > 0 ? balance / largest : 0,
    };
  });

  const maturities = investments
    .filter((investment) => {
      if (!investment.dueDate) return false;
      return !Number.isNaN(new Date(investment.dueDate).getTime());
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate as string).getTime() -
        new Date(b.dueDate as string).getTime(),
    )
    .map((investment) => {
      const date = new Date(investment.dueDate as string);
      return {
        id: investment.id,
        date,
        dateLabel: maturityDateLabel(date),
        name: investment.name,
        balance: investment.balance,
      };
    });

  return { total, profit, allocations, maturities };
}
