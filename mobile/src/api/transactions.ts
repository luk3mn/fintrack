import { api } from "./client";
import { endpoints } from "./endpoints";
import type { PluggyPage, PluggyTransaction } from "./types";
import { toTransaction } from "@/lib/mappers";

const PAGE_SIZE = 500;
const MAX_PAGES = 20;

/**
 * Fetches every transaction for one account in a closed date interval.
 * The worker already converts Pluggy's cursor pagination into this page shape.
 */
export async function fetchPeriodTransactions(
  accountId: string,
  from: string,
  to: string,
) {
  const results: PluggyTransaction[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const data = await api<PluggyPage<PluggyTransaction>>(
      endpoints.transactions,
      {
        query: { accountId, from, to, page, pageSize: PAGE_SIZE },
      },
    );

    results.push(...data.results);
    totalPages = data.totalPages;
    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES);

  return results.map(toTransaction);
}
