import { Hono } from "hono";
import { requireUser } from "./auth";
import { csv, type AppEnv, type Env } from "./env";
import { connectionIdentityFromAccounts } from "./institutions";
import { pluggy, UpstreamError } from "./pluggy";

type Paginated = { results: Record<string, unknown>[] };
type CursorPage = {
  results: Record<string, unknown>[];
  next: string | null;
};

type Account = {
  name?: string | null;
  marketingName?: string | null;
  taxNumber?: string | null;
  bankData?: { transferNumber?: string | null } | null;
};

type Item = {
  id: string;
  status: string;
  executionStatus?: string;
  lastUpdatedAt?: string | null;
  connector?: { id?: number; name?: string };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CURSOR_PAGES = 20;
const MEU_PLUGGY_CONNECTOR_ID = 200;

const itemIds = (env: Env) => csv(env.PLUGGY_ITEM_IDS);

const isMeuPluggy = (item: Item) =>
  item.connector?.id === MEU_PLUGGY_CONNECTOR_ID ||
  item.connector?.name?.trim().toLowerCase() === "meupluggy";

const cursorQuery = (next: string) =>
  Object.fromEntries(new URLSearchParams(next.replace(/^\?/, "")).entries());

const app = new Hono<AppEnv>();

app.use("*", requireUser);

app.get("/items", async (c) => {
  const items = await Promise.all(
    itemIds(c.env).map(async (id) => {
      const [item, accounts] = await Promise.all([
        pluggy<Item>(c.env, `/items/${id}`),
        pluggy<Paginated>(c.env, "/accounts", { query: { itemId: id } }),
      ]);

      const connector = item.connector?.name?.trim();
      const accountsList = accounts.results as Account[];
      const identity = connectionIdentityFromAccounts(accountsList);
      const institution = isMeuPluggy(item)
        ? identity.institution
        : connector;

      return {
        id: item.id,
        status: item.status,
        executionStatus: item.executionStatus,
        lastUpdatedAt: item.lastUpdatedAt,
        connector,
        institution,
        personType: identity.personType,
      };
    }),
  );

  return c.json(items);
});

app.get("/accounts", async (c) => {
  const lists = await Promise.all(
    itemIds(c.env).map(async (itemId) => {
      const data = await pluggy<Paginated>(c.env, "/accounts", {
        query: { itemId },
      });

      const accounts = data.results as Account[];
      const institution = connectionIdentityFromAccounts(accounts).institution;

      return accounts.map((account) => ({
        ...account,
        itemId,
        institution,
      }));
    }),
  );

  return c.json(lists.flat());
});

app.get("/investments", async (c) => {
  const lists = await Promise.all(
    itemIds(c.env).map(async (itemId) => {
      const data = await pluggy<Paginated>(c.env, "/investments", {
        query: { itemId },
      });

      return data.results.map((investment) => ({ ...investment, itemId }));
    }),
  );

  return c.json(lists.flat());
});

app.get("/transactions", async (c) => {
  const { accountId, from, to } = c.req.query();

  if (!accountId || !UUID.test(accountId)) {
    return c.json({ error: "invalid_account_id" }, 400);
  }

  if ((from && !ISO_DATE.test(from)) || (to && !ISO_DATE.test(to))) {
    return c.json({ error: "invalid_date" }, 400);
  }

  const results: Record<string, unknown>[] = [];
  let query: Record<string, string | undefined> = {
    accountId,
    dateFrom: from,
    dateTo: to,
  };

  for (let page = 0; page < MAX_CURSOR_PAGES; page += 1) {
    const data = await pluggy<CursorPage>(c.env, "/v2/transactions", {
      query,
    });

    for (const transaction of data.results) {
      results.push({
        id: transaction.id,
        accountId: transaction.accountId ?? accountId,
        date:
          typeof transaction.date === "string"
            ? transaction.date.slice(0, 10)
            : transaction.date,
        description:
          transaction.descriptionRaw ?? transaction.description ?? "",
        amount: transaction.amount,
        type:
          transaction.type === "DEBIT" || transaction.type === "CREDIT"
            ? transaction.type
            : typeof transaction.amount === "number" && transaction.amount < 0
              ? "DEBIT"
              : "CREDIT",
        category: transaction.category,
        currencyCode: transaction.currencyCode,
      });
    }

    if (!data.next) break;
    query = cursorQuery(data.next);
  }

  return c.json({
    total: results.length,
    totalPages: 1,
    page: 1,
    results,
  });
});

app.post("/refresh/:itemId", async (c) => {
  const itemId = c.req.param("itemId");

  if (!itemIds(c.env).includes(itemId)) {
    return c.json({ error: "not_found" }, 404);
  }

  const item = await pluggy<Item>(c.env, `/items/${itemId}`, {
    method: "PATCH",
    body: {},
  });

  return c.json({ id: item.id, status: item.status });
});

app.notFound((c) => c.json({ error: "not_found" }, 404));

app.onError((error, c) => {
  if (error instanceof UpstreamError) {
    return c.json({ error: "upstream_error" }, 502);
  }

  return c.json({ error: "internal_error" }, 500);
});

export default app;
