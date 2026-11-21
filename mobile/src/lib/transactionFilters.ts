import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PERIOD_OPTIONS,
  TYPE_OPTIONS,
  type PeriodKey,
  type TransactionTypeFilter,
} from "./transactions";

export type TransactionFilters = {
  period: PeriodKey;
  institutions: string[];
  type: TransactionTypeFilter;
};

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  period: "current-month",
  institutions: [],
  type: "all",
};

const STORAGE_KEY = "@fintrack:transaction-filters";

const isPeriodKey = (value: unknown): value is PeriodKey =>
  PERIOD_OPTIONS.some((option) => option.key === value);

const isTypeFilter = (value: unknown): value is TransactionTypeFilter =>
  TYPE_OPTIONS.some((option) => option.key === value);

export async function loadTransactionFilters(): Promise<TransactionFilters> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TRANSACTION_FILTERS;

    const parsed = JSON.parse(raw) as Partial<TransactionFilters>;

    return {
      period: isPeriodKey(parsed.period)
        ? parsed.period
        : DEFAULT_TRANSACTION_FILTERS.period,
      institutions: Array.isArray(parsed.institutions)
        ? parsed.institutions.filter(
            (name): name is string => typeof name === "string",
          )
        : [],
      type: isTypeFilter(parsed.type)
        ? parsed.type
        : DEFAULT_TRANSACTION_FILTERS.type,
    };
  } catch {
    return DEFAULT_TRANSACTION_FILTERS;
  }
}

export async function saveTransactionFilters(
  filters: TransactionFilters,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Filter persistence is a convenience; never break the screen for it.
  }
}
