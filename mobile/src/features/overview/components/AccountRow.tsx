import { Text, View } from "react-native";
import { formatBRL } from "@/lib/money";
import type { Account } from "@/types/domain";

type Props = {
  account: Account;
  divider: boolean;
};

const KIND_LABELS = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit: "Cartão de crédito",
} as const;

export function AccountRow({ account, divider }: Props) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${divider ? "border-t border-border" : ""}`}
    >
      <View className="flex-1 pr-4">
        <Text numberOfLines={1} className="text-base text-foreground">
          {account.institution}
        </Text>
        <Text className="text-sm text-muted">{KIND_LABELS[account.kind]}</Text>
      </View>

      <Text
        className={`text-base font-semibold ${account.kind === "credit" ? "text-danger" : "text-foreground"}`}
      >
        {formatBRL(account.balance)}
      </Text>
    </View>
  );
}
