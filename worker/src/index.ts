import { Hono } from "hono";
import { requireUser } from "./auth";
import { csv, type AppEnv, type Env } from "./env";
import { pluggy, UpstreamError } from "./pluggy";

type Paginated = { results: Record<string, unknown>[] };

type Item = {
  id: string;
  status: string;
  executionStatus?: string;
  lastUpdatedAt?: string | null;
  connector?: { name?: string };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PAGE_SIZE = 500;

const itemIds = (env: Env) => csv(env.PLUGGY_ITEM_IDS);

const app = new Hono<AppEnv>();

app.use("*", requireUser);

app.get("/items", async (c) => {
  const items = await Promise.all(
    itemIds(c.env).map((id) => pluggy<Item>(c.env, `/items/${id}`)),
  );

  return c.json(
    items.map((item) => ({
      id: item.id,
      status: item.status,
      executionStatus: item.executionStatus,
      lastUpdatedAt: item.lastUpdatedAt,
      connector: item.connector?.name,
    })),
  );
});

app.get("/accounts", async (c) => {
  const lists = await Promise.all(
    itemIds(c.env).map(async (itemId) => {
      const data = await pluggy<Paginated>(c.env, "/accounts", {
        query: { itemId },
      });

      return data.results.map((account) => ({ ...account, itemId }));
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
