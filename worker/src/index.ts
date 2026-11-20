import { Hono } from "hono";
import { requireUser } from "./auth";
import { csv, type AppEnv, type Env } from "./env";
import { institutionFromAccounts } from "./institutions";
import { pluggy, UpstreamError } from "./pluggy";

type Paginated = { results: Record<string, unknown>[] };

type Account = {
  name?: string | null;
  marketingName?: string | null;
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
const MAX_PAGE_SIZE = 500;
const MEU_PLUGGY_CONNECTOR_ID = 200;

const itemIds = (env: Env) => csv(env.PLUGGY_ITEM_IDS);

const isMeuPluggy = (item: Item) =>
  item.connector?.id === MEU_PLUGGY_CONNECTOR_ID ||
  item.connector?.name?.trim().toLowerCase() === "meupluggy";

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
      const institution = isMeuPluggy(item)
        ? institutionFromAccounts(accounts.results as Account[])
        : connector;

      return {
        id: item.id,
        status: item.status,
        executionStatus: item.executionStatus,
        lastUpdatedAt: item.lastUpdatedAt,
        connector,
        institution,
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
      const institution = institutionFromAccounts(accounts);

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
  const { accountId, from, to, page, pageSize } = c.req.query();

  if (!accountId || !UUID.test(accountId)) {
    return c.json({ error: "invalid_account_id" }, 400);
  }

  if ((from && !ISO_DATE.test(from)) || (to && !ISO_DATE.test(to))) {
    return c.json({ error: "invalid_date" }, 400);
  }

  const size = Math.min(Number(pageSize) || 100, MAX_PAGE_SIZE);
  const pageNumber = Math.max(Number(page) || 1, 1);

  const data = await pluggy(c.env, "/transactions", {
    query: {
      accountId,
      from,
      to,
      page: String(pageNumber),
      pageSize: String(size),
    },
  });

  return c.json(data);
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
