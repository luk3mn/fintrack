import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeText } from "./transactions";

const STORAGE_KEY = "@fintrack:spending-category-rules";

/**
 * A rule maps a normalized establishment name to the category the user chose.
 * It is kept locally so every future transaction from the same name is
 * categorized the same way, even after the app is closed.
 */
export type SpendingCategoryRule = {
  match: string;
  name: string;
  category: string;
};

export async function loadSpendingCategoryRules(): Promise<
  SpendingCategoryRule[]
> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is SpendingCategoryRule =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as SpendingCategoryRule).match === "string" &&
        typeof (item as SpendingCategoryRule).name === "string" &&
        typeof (item as SpendingCategoryRule).category === "string",
    );
  } catch {
    return [];
  }
}

export async function saveSpendingCategoryRules(
  rules: SpendingCategoryRule[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch {
    // Rule persistence is a convenience; never break the screen for it.
  }
}

export function upsertSpendingCategoryRule(
  rules: SpendingCategoryRule[],
  name: string,
  category: string,
): SpendingCategoryRule[] {
  const match = normalizeText(name);
  if (!match || !category.trim()) return rules;

  return [
    ...rules.filter((rule) => normalizeText(rule.match) !== match),
    { match, name: name.trim(), category: category.trim() },
  ];
}

export function removeSpendingCategoryRule(
  rules: SpendingCategoryRule[],
  name: string,
): SpendingCategoryRule[] {
  const match = normalizeText(name);
  return rules.filter((rule) => normalizeText(rule.match) !== match);
}

/**
 * Finds the most specific rule for an establishment. Prefixes and substrings
 * are accepted so small variations in the bank description still match.
 */
export function categoryForEstablishment(
  name: string,
  rules: SpendingCategoryRule[],
): string | undefined {
  const key = normalizeText(name);
  if (!key) return undefined;

  let best: { category: string; length: number } | undefined;

  for (const rule of rules) {
    const match = normalizeText(rule.match);
    if (!match) continue;

    const matches =
      key === match ||
      (match.length >= 4 && key.startsWith(match)) ||
      (match.length >= 6 && key.includes(match));

    if (matches && match.length > (best?.length ?? 0)) {
      best = { category: rule.category, length: match.length };
    }
  }

  return best?.category;
}
