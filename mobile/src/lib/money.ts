import type { Cents } from "@/types/domain";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const toCents = (value: number): Cents => Math.round(value * 100);

export const formatBRL = (cents: Cents) => brl.format(cents / 100);
