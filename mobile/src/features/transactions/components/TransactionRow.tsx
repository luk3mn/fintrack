import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { InstitutionLogo } from "@/components/ui/InstitutionLogo";
import { formatSignedBRL } from "@/lib/money";
import {
  transactionIconName,
  type TransactionItem,
} from "@/lib/transactions";
import type { TransactionColors } from "../theme";

type Props = {
  item: TransactionItem;
  colors: TransactionColors;
};

export function TransactionRow({ item, colors }: Props) {
  const icon = transactionIconName(item) as keyof typeof Ionicons.glyphMap;

  return (
    <View className="flex-row items-center py-4">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.tile }}
      >
        <Ionicons name={icon} size={19} color={colors.accent} />
      </View>

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
        {formatSignedBRL(item.amount)}
      </Text>
    </View>
  );
}
