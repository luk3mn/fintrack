export const KNOWN_INSTITUTIONS = [
  {
    key: "nubank",
    label: "Nubank",
    logo: "nubank",
    pattern: /\bnu financeira\b|\bnu reserva\b|\bnubank\b/,
  },
  {
    key: "banco inter",
    label: "Inter",
    logo: "banco inter",
    pattern: /\bbanco inter\b|\binter\b/,
  },
  {
    key: "mercado pago",
    label: "Mercado Pago",
    logo: "mercado pago",
    pattern: /\bmercado pago\b|\bmercadopago\b/,
  },
] as const;

export type KnownInstitutionKey = (typeof KNOWN_INSTITUTIONS)[number]["key"];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function institutionKey(
  value?: string | null,
): KnownInstitutionKey | undefined {
  if (!value) return undefined;
  const normalized = normalize(value);

  return KNOWN_INSTITUTIONS.find((institution) =>
    institution.pattern.test(normalized),
  )?.key;
}
