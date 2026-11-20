import { Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type {
  InvestmentAllocation,
  InvestmentSummary,
} from "@/lib/investments";
import { formatBRLShort } from "@/lib/money";

type Props = {
  summary: InvestmentSummary;
};

const BAR_COLORS: Record<InvestmentAllocation["category"], string> = {
  fixed: "bg-accent",
  funds: "bg-warm",
  equity: "bg-subtle",
};

export function AllocationSection({ summary }: Props) {
  return (
    <View className="pt-6">
      <SectionTitle title="Alocação" />

      <View className="flex-row items-center pt-4">
        <View className="h-[106px] w-[106px] items-center justify-center rounded-full bg-background">
          <View className="h-[74px] w-[74px] items-center justify-center rounded-full bg-card">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className="text-[13px] font-semibold text-foreground"
            >
              {formatBRLShort(summary.total)}
            </Text>
          </View>
        </View>

        <View className="ml-4 flex-1 gap-[10px]">
          {summary.allocations.map((allocation) => (
            <View key={allocation.category}>
              <View className="flex-row items-center justify-between gap-2">
                <Text
                  numberOfLines={1}
                  className="flex-1 text-xs text-foreground"
                >
                  {allocation.label}
                </Text>
                <Text className="text-xs text-foreground">
                  {formatBRLShort(allocation.balance)}
                </Text>
              </View>

              <View className="mt-1 h-[7px] overflow-hidden rounded-full bg-card">
                <View
                  style={{ width: `${Math.round(allocation.barRatio * 100)}%` }}
                  className={`h-full rounded-full ${BAR_COLORS[allocation.category]}`}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
