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
