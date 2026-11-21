import type { Cents } from "@/types/domain";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const toCents = (value: number): Cents => Math.round(value * 100);

export const formatBRL = (cents: Cents) => brl.format(cents / 100);

export const formatBRLCompact = (cents: Cents) =>
  brlCompact.format(cents / 100);

const shortNumber = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

export const formatBRLShort = (cents: Cents) => {
  const value = cents / 100;
  const magnitude = Math.abs(value);

  if (magnitude >= 1_000_000) {
    return `R$ ${shortNumber.format(value / 1_000_000)}mi`;
  }
  if (magnitude >= 10_000) {
    return `R$ ${shortNumber.format(value / 1_000).replace(",0", "")}k`;
  }
  if (magnitude >= 1_000) {
    return `R$ ${shortNumber.format(value / 1_000)}k`;
  }

  return formatBRL(cents);
};

export const formatSignedBRL = (cents: Cents) =>
  cents > 0 ? `+ ${formatBRL(cents)}` : formatBRL(cents);

export const formatNetBRL = (cents: Cents) =>
  cents >= 0 ? `+ ${formatBRL(cents)}` : `- ${formatBRL(Math.abs(cents))}`;
