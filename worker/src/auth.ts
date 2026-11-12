import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { csv, type AppEnv } from "./env";

const jwks = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const projectId = c.env.FIREBASE_PROJECT_ID;
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid = payload.sub;

    if (!uid || !csv(c.env.ALLOWED_UIDS).includes(uid)) {
      return c.json({ error: "forbidden" }, 403);
    }

    c.set("uid", uid);
  } catch {
    return c.json({ error: "unauthorized" }, 401);
  }

  await next();
});
