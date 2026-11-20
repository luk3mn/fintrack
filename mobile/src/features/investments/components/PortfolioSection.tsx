import { Text, View } from "react-native";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { InvestmentFilter } from "@/lib/investments";
import type { Investment } from "@/types/domain";
import { FilterTabs } from "./FilterTabs";
import { InvestmentListRow } from "./InvestmentListRow";

type Props = {
  investments: Investment[];
  filter: InvestmentFilter;
  onFilterChange: (filter: InvestmentFilter) => void;
};

export function PortfolioSection({
  investments,
  filter,
  onFilterChange,
}: Props) {
  return (
    <View className="pt-6">
      <SectionTitle title="Carteira" />

      <FilterTabs value={filter} onChange={onFilterChange} />

      <View className="pt-2">
        {investments.length === 0 ? (
          <Text className="py-4 text-xs text-soft">
            Nenhum investimento encontrado.
          </Text>
        ) : (
          investments.map((investment) => (
            <InvestmentListRow key={investment.id} investment={investment} />
          ))
        )}
      </View>
    </View>
  );
}
