export type Env = {
  PLUGGY_CLIENT_ID: string;
  PLUGGY_CLIENT_SECRET: string;
  PLUGGY_ITEM_IDS: string;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_UIDS: string;
};

export type Variables = {
  uid: string;
};

export type AppEnv = {
  Bindings: Env;
  Variables: Variables;
};

export const csv = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
