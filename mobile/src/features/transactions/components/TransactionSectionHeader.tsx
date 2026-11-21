import { Text, View } from "react-native";
import { formatNetBRL } from "@/lib/money";
import type { Cents } from "@/types/domain";
import type { TransactionColors } from "../theme";

type Props = {
  label: string;
  total: Cents;
  colors: TransactionColors;
};

export function TransactionSectionHeader({ label, total, colors }: Props) {
  return (
    <View
      className="flex-row items-center justify-between px-1 pb-2 pt-4"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="text-xs font-semibold tracking-wide"
        style={{ color: colors.muted }}
      >
        {label}
      </Text>
      <Text className="text-xs font-medium" style={{ color: colors.warm }}>
        {formatNetBRL(total)}
      </Text>
    </View>
  );
}
