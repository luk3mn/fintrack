export const endpoints = {
  items: "/items",
  accounts: "/accounts",
  investments: "/investments",
  transactions: "/transactions",
  refresh: (itemId: string) => `/refresh/${itemId}`,
};
