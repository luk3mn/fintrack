import { Pressable, Text, View } from "react-native";
import type { TransactionColors } from "../theme";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  colors: TransactionColors;
};

function Chip({ label, active = false, onPress, colors }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="rounded-lg px-2 py-1 active:opacity-70"
      style={{ backgroundColor: active ? colors.tile : "transparent" }}
    >
      <Text
        className="text-xs font-medium"
        style={{ color: colors.accent }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type Props = {
  periodLabel: string;
  institutionLabel: string;
  typeFilterLabel: string;
  hasPeriodFilter: boolean;
  hasInstitutionFilter: boolean;
  hasTypeFilter: boolean;
  onOpenFilters: () => void;
  colors: TransactionColors;
};

export function FilterChips({
  periodLabel,
  institutionLabel,
  typeFilterLabel,
  hasPeriodFilter,
  hasInstitutionFilter,
  hasTypeFilter,
  onOpenFilters,
  colors,
}: Props) {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Chip
        label={periodLabel}
        active={hasPeriodFilter}
        onPress={onOpenFilters}
        colors={colors}
      />
      <Chip
        label={institutionLabel}
        active={hasInstitutionFilter}
        onPress={onOpenFilters}
        colors={colors}
      />
      <Chip
        label={typeFilterLabel}
        active={hasTypeFilter}
        onPress={onOpenFilters}
        colors={colors}
      />
    </View>
  );
}
