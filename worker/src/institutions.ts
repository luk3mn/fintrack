type BankAccount = {
  name?: string | null;
  marketingName?: string | null;
  taxNumber?: string | null;
  bankData?: { transferNumber?: string | null } | null;
};

export type PersonType = "PF" | "PJ";

export type ConnectionIdentity = {
  institution?: string;
  personType?: PersonType;
};

const COMPE: Record<string, string> = {
  "001": "Banco do Brasil",
  "003": "Banco da Amazônia",
  "004": "Banco do Nordeste",
  "021": "Banestes",
  "033": "Santander",
  "037": "Banpará",
  "041": "Banrisul",
  "047": "Banese",
  "070": "BRB",
  "077": "Banco Inter",
  "085": "Ailos",
  "104": "Caixa",
  "121": "Agibank",
  "136": "Unicred",
  "197": "Stone",
  "208": "BTG Pactual",
  "212": "Banco Original",
  "218": "BS2",
  "237": "Bradesco",
  "246": "ABC Brasil",
  "260": "Nubank",
  "290": "PagBank",
  "323": "Mercado Pago",
  "336": "C6 Bank",
  "341": "Itaú",
  "348": "XP",
  "380": "PicPay",
  "389": "Mercantil do Brasil",
  "422": "Safra",
  "655": "Votorantim",
  "707": "Daycoval",
  "748": "Sicredi",
  "756": "Sicoob",
};

const GENERIC_ACCOUNT_NAME =
  /^(conta|cc|corrente|poupança|poupanca|pagamento|carteira|crédito|credito|cartão|cartao|gold|black|platinum|internacional|standard|principal|digital|salário|salario)\b/i;

function bankCode(account: BankAccount): string | undefined {
  return account.bankData?.transferNumber
    ?.trim()
    .match(/^(\d{3})\//)?.[1];
}

function taxDigits(account: BankAccount): string {
  return account.taxNumber?.replace(/\D/g, "") ?? "";
}

/**
 * Pluggy exposes the institution through `connector.name` for direct
 * connectors, but Meu Pluggy proxy items always report the "MeuPluggy"
 * connector. For those, the bank code in `bankData.transferNumber` and the
 * descriptive account name are the only institution signals available.
 */
export function institutionFromAccounts(
  accounts: BankAccount[],
): string | undefined {
  for (const account of accounts) {
    const code = bankCode(account);
    const institution = code ? COMPE[code] : undefined;

    if (institution) return institution;
  }

  for (const account of accounts) {
    for (const value of [account.marketingName, account.name]) {
      const name = value?.trim();

      if (name && !GENERIC_ACCOUNT_NAME.test(name)) return name;
    }
  }

  return undefined;
}

/**
 * A CPF has 11 digits; a CNPJ has 14. This is what tells apart two
 * connections to the same institution (for example Nubank PF and Nubank PJ).
 */
export function personTypeFromAccounts(
  accounts: BankAccount[],
): PersonType | undefined {
  for (const account of accounts) {
    const digits = taxDigits(account);

    if (digits.length === 14) return "PJ";
    if (digits.length === 11) return "PF";
  }

  return undefined;
}

export function connectionIdentityFromAccounts(
  accounts: BankAccount[],
): ConnectionIdentity {
  return {
    institution: institutionFromAccounts(accounts),
    personType: personTypeFromAccounts(accounts),
  };
}
