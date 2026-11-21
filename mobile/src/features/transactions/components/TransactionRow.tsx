import { Text, View } from "react-native";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import { formatBRL, formatSignedBRL } from "@/lib/money";
import { transactionIconKey, type TransactionItem } from "@/lib/transactions";
import { TransactionIcon } from "./TransactionIcon";
import type { TransactionColors } from "../theme";

type Props = {
  item: TransactionItem;
  colors: TransactionColors;
};

export function TransactionRow({ item, colors }: Props) {
  return (
    <View className="flex-row items-center py-4">
      <TransactionIcon
        name={transactionIconKey(item)}
        label={item.description || "Transação"}
        size={40}
      />

      <View className="min-w-0 flex-1 pl-3">
        <Text
          className="pr-2 text-sm"
          style={{ color: colors.foreground }}
          numberOfLines={1}
        >
          {item.description || "Transação"}
        </Text>
        <View className="flex-row items-center gap-1 pt-1">
          <InstitutionLogo
            institution={item.institution}
            name={item.institution}
            size={12}
          />
          <Text
            className="min-w-0 flex-1 text-xs"
            style={{ color: colors.muted }}
            numberOfLines={1}
          >
            {item.institution} - {item.categoryLabel}
          </Text>
        </View>
      </View>

      <Text
        className="pl-2 text-sm font-medium"
        style={{ color: colors.figure }}
      >
        {item.isInternalTransfer
          ? formatBRL(Math.abs(item.amount))
          : formatSignedBRL(item.amount)}
      </Text>
    </View>
  );
}
