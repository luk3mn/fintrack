import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Account } from "@/types/domain";

type Props = {
  account: Account;
};

const KIND_LABELS: Record<Account["kind"], string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit: "Cartão de crédito",
};

const SUBTYPE_LABELS: Record<string, string> = {
  CHECKING_ACCOUNT: "Conta corrente",
  SAVINGS_ACCOUNT: "Poupança",
  PAYMENT_ACCOUNT: "Conta de pagamento",
  CREDIT_CARD: "Cartão de crédito",
};

function accountTitle(account: Account) {
  const prefix = account.kind === "credit" ? "Cartão" : "Conta";
  const digits = account.number?.replace(/\D/g, "");
  const suffix =
    digits && digits.length >= 4 ? ` · •• ${digits.slice(-4)}` : "";

  return `${prefix} ${account.institution}${suffix}`;
}

export function AccountListRow({ account }: Props) {
  const balance =
    account.kind === "credit" ? -Math.abs(account.balance) : account.balance;
  const subtitle = account.subtype
    ? (SUBTYPE_LABELS[account.subtype] ?? KIND_LABELS[account.kind])
    : KIND_LABELS[account.kind];

  return (
    <View className="pb-[17px] pt-[10px]">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          numberOfLines={1}
          className="flex-1 text-xs font-medium leading-[15px] text-foreground"
        >
          {accountTitle(account)}
        </Text>
        <Text className="text-xs font-medium leading-[15px] text-foreground">
          {formatBRL(balance)}
        </Text>
      </View>

      <Text className="pt-2 text-[10px] leading-[12px] text-soft">
        {subtitle}
      </Text>
    </View>
  );
}
