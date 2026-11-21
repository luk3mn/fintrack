/**
 * Pluggy returns category names in English (e.g. "Eating out"). Keep a single
 * translation table so transactions and the overview chart show the same text.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  groceries: "Mercado",
  supermarket: "Mercado",
  restaurants: "Restaurantes",
  "eating out": "Restaurantes",
  "food delivery": "Delivery",
  "food and drink": "Alimentação",
  "food and drinks": "Alimentação",
  food: "Alimentação",
  housing: "Moradia",
  rent: "Moradia",
  transportation: "Transporte",
  transport: "Transporte",
  "taxi and ride-hailing": "Transporte por aplicativo",
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
  "proceeds interests and dividends": "Rendimentos",
  "fixed income": "Renda fixa",
  "mutual funds": "Fundos de investimento",
  "automatic investment": "Aplicação automática",
  transfers: "Transferências",
  "same person transfer": "Transferência entre contas",
  "same person transfer - pix": "Transferência entre contas",
  "same person transfer - ted": "Transferência entre contas",
  "same person transfer - cash": "Transferência entre contas",
  "transfer - internal": "Transferência entre contas",
  "transfer - pix": "Transferência Pix",
  "transfer - ted": "Transferência TED",
  "transfer - doc": "Transferência DOC",
  "transfer - bank slip": "Transferência por boleto",
  "transfer - cash": "Transferência em dinheiro",
  "transfer - check": "Transferência por cheque",
  "transfer - foreign exchange": "Transferência internacional",
  "third-party transfers": "Transferências para terceiros",
  "credit card payment": "Pagamento de fatura",
  salary: "Salário",
  income: "Receitas",
  other: "Outros",
};

export function categoryLabel(category?: string | null) {
  const raw = category?.trim();
  if (!raw) return "Transação";
  return CATEGORY_LABELS[raw.toLowerCase()] ?? raw;
}
