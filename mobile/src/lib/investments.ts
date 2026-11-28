import { maturityDateLabel } from "@/lib/dates";
import { institutionKey, KNOWN_INSTITUTIONS } from "@/lib/institutions";
import { normalizeText } from "@/lib/transactions";
import type { Cents, Investment, Transaction } from "@/types/domain";

export type InvestmentCategory = "fixed" | "funds" | "equity";
export type InvestmentFilter = "all" | InvestmentCategory;
export type InvestmentFlowCategory = InvestmentCategory | "other";

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

export const INVESTMENT_FLOW_LABELS: Record<InvestmentFlowCategory, string> = {
  ...CATEGORY_LABELS,
  other: "Outros",
};

export const INVESTMENT_FLOW_ORDER: InvestmentFlowCategory[] = [
  ...CATEGORY_ORDER,
  "other",
];

/**
 * Match whole words only. Plain `includes("acao")` misclassifies ordinary
 * purchases because words such as "aplicacao", "fundacao" and "alienacao"
 * contain that substring. The same applies to "lca" inside "calcados".
 */
const wholeWords = (words: string[]) =>
  new RegExp(`\\b(?:${words.join("|")})\\b`);

const FIXED_HINTS = [
  "rdb",
  "cdb",
  "lci",
  "lca",
  "tesouro",
  "poupanca",
  "debenture",
  "titulo",
  "titulos",
  "prefixado",
  "posfixado",
  "cdi",
  "ipca",
  "fixed income",
  "renda fixa",
];
const FUND_HINTS = [
  "fundo",
  "fundos",
  "multimercado",
  "mutual fund",
  "mutual funds",
];
const EQUITY_HINTS = [
  "acao",
  "acoes",
  "etf",
  "etfs",
  "stock",
  "stocks",
  "bolsa",
  "b3",
];
const GENERIC_FLOW_HINTS = [
  "aplicacao",
  "aplicacoes",
  "invest",
  "investimento",
  "investimentos",
  "investment",
  "investments",
  "resgate",
  "resgates",
];
// Yield is real, but it is not money applied to the principal.
const YIELD_HINTS = [
  "rendimento",
  "rendimentos",
  "juros",
  "dividendo",
  "dividendos",
  "proceeds",
  "interest",
];
const REDEMPTION_HINTS = ["resgate", "resgates", "redeem", "redemption"];

const FIXED = wholeWords(FIXED_HINTS);
const FUNDS = wholeWords(FUND_HINTS);
const EQUITY = wholeWords(EQUITY_HINTS);
const GENERIC_FLOW = wholeWords(GENERIC_FLOW_HINTS);
const YIELD = wholeWords(YIELD_HINTS);
const REDEMPTION = wholeWords(REDEMPTION_HINTS);

type TransactionText = Pick<Transaction, "description" | "category">;

const flowText = (transaction: TransactionText) =>
  normalizeText(
    `${transaction.description ?? ""} ${transaction.category ?? ""}`,
  );

/** Real investment movement type inferred from the bank's own description. */
export function investmentFlowCategory(
  transaction: TransactionText,
): InvestmentFlowCategory | undefined {
  const text = flowText(transaction);
  if (!text || YIELD.test(text)) return undefined;

  // Explicit products win over the generic "aplicação"/"invest" wording.
  if (FIXED.test(text)) return "fixed";
  if (FUNDS.test(text)) return "funds";
  if (EQUITY.test(text)) return "equity";
  return GENERIC_FLOW.test(text) ? "other" : undefined;
}

/** Resgates are excluded from the accumulated-applications series. */
export function isInvestmentRedemption(transaction: TransactionText) {
  return REDEMPTION.test(flowText(transaction));
}

export function investmentCategory(investment: Investment): InvestmentCategory {
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
  maturities: InvestmentMaturity[];
};

export type InvestmentInstitution = {
  key: string;
  label: string;
  logo: string;
  balance: Cents;
  count: number;
  share: number;
};

export function summarizeInvestmentsByInstitution(
  investments: Investment[],
): InvestmentInstitution[] {
  const totals = new Map<string, { balance: Cents; count: number }>();

  for (const investment of investments) {
    const key =
      institutionKey(
        investment.institution ?? investment.issuer ?? investment.name,
      ) ?? "other";
    const current = totals.get(key) ?? { balance: 0, count: 0 };

    current.balance += investment.balance;
    current.count += 1;
    totals.set(key, current);
  }

  const total = investments.reduce((sum, item) => sum + item.balance, 0);
  const rows: InvestmentInstitution[] = KNOWN_INSTITUTIONS.map(
    ({ key, label, logo }) => {
      const current = totals.get(key) ?? { balance: 0, count: 0 };

      return {
        key,
        label,
        logo,
        balance: current.balance,
        count: current.count,
        share: total > 0 ? current.balance / total : 0,
      };
    },
  );

  const other = totals.get("other");
  if (other) {
    rows.push({
      key: "other",
      label: "Outros",
      logo: "Outros",
      balance: other.balance,
      count: other.count,
      share: total > 0 ? other.balance / total : 0,
    });
  }

  return rows;
}

export function summarizeInvestments(
  investments: Investment[],
): InvestmentSummary {
  const total = investments.reduce((sum, item) => sum + item.balance, 0);
  const profit = investments.reduce((sum, item) => sum + (item.profit ?? 0), 0);

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

  return { total, profit, maturities };
}
