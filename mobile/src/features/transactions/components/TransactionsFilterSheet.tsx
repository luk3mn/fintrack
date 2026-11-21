import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
} from "@/lib/transactionFilters";
import { PERIOD_OPTIONS, TYPE_OPTIONS } from "@/lib/transactions";
import type { TransactionColors } from "../theme";

type OptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: TransactionColors;
};

function OptionRow({ label, selected, onPress, colors }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl px-3 py-3 active:opacity-70"
      style={{ backgroundColor: selected ? colors.tile : colors.card }}
    >
      <Text
        className="flex-1 pr-2 text-sm"
        style={{ color: colors.foreground }}
      >
        {label}
      </Text>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={18}
        color={selected ? colors.accent : colors.muted}
      />
    </Pressable>
  );
}

function SectionLabel({
  label,
  colors,
}: {
  label: string;
  colors: TransactionColors;
}) {
  return (
    <Text
      className="text-xs font-semibold uppercase tracking-wide"
      style={{ color: colors.muted }}
    >
      {label}
    </Text>
  );
}

type OptionsProps = {
  draft: TransactionFilters;
  institutions: string[];
  onChange: (
    update: (current: TransactionFilters) => TransactionFilters,
  ) => void;
  colors: TransactionColors;
};

function FilterOptions({
  draft,
  institutions,
  onChange,
  colors,
}: OptionsProps) {
  const toggleInstitution = (name: string) => {
    onChange((current) => ({
      ...current,
      institutions: current.institutions.includes(name)
        ? current.institutions.filter((item) => item !== name)
        : [...current.institutions, name],
    }));
  };

  return (
    <View className="gap-5">
      <View className="gap-2">
        <SectionLabel label="Período" colors={colors} />
        {PERIOD_OPTIONS.map((option) => (
          <OptionRow
            key={option.key}
            label={option.label}
            selected={draft.period === option.key}
            onPress={() =>
              onChange((current) => ({ ...current, period: option.key }))
            }
            colors={colors}
          />
        ))}
      </View>

      <View className="gap-2">
        <SectionLabel label="Instituição" colors={colors} />
        <OptionRow
          label="Todas as contas"
          selected={draft.institutions.length === 0}
          onPress={() =>
            onChange((current) => ({ ...current, institutions: [] }))
          }
          colors={colors}
        />
        {institutions.map((name) => (
          <OptionRow
            key={name}
            label={name}
            selected={draft.institutions.includes(name)}
            onPress={() => toggleInstitution(name)}
            colors={colors}
          />
        ))}
      </View>

      <View className="gap-2">
        <SectionLabel label="Tipo" colors={colors} />
        {TYPE_OPTIONS.map((option) => (
          <OptionRow
            key={option.key}
            label={option.label}
            selected={draft.type === option.key}
            onPress={() =>
              onChange((current) => ({ ...current, type: option.key }))
            }
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

type Props = {
  visible: boolean;
  filters: TransactionFilters;
  institutions: string[];
  onApply: (filters: TransactionFilters) => void;
  onDismiss: () => void;
  colors: TransactionColors;
};

export function TransactionsFilterSheet({
  visible,
  filters,
  institutions,
  onApply,
  onDismiss,
  colors,
}: Props) {
  const [draft, setDraft] = useState<TransactionFilters>(filters);
  const [wasVisible, setWasVisible] = useState(visible);

  // Start every opening from the currently applied filters.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(filters);
  }

  const apply = () => {
    onApply({
      ...draft,
      institutions: draft.institutions.filter((name) =>
        institutions.includes(name),
      ),
    });
    onDismiss();
  };

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Filtros"
      subtitle="Selecione um ou mais bancos e toque em aplicar."
      containerColor={colors.card}
      footer={
        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => setDraft(DEFAULT_TRANSACTION_FILTERS)}
            className="h-11 flex-1 items-center justify-center rounded-xl active:opacity-70"
            style={{ backgroundColor: colors.background }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: colors.muted }}
            >
              Limpar
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={apply}
            className="h-11 flex-1 items-center justify-center rounded-xl active:opacity-70"
            style={{ backgroundColor: colors.accent }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.accentForeground }}
            >
              Aplicar filtros
            </Text>
          </Pressable>
        </View>
      }
    >
      <FilterOptions
        draft={draft}
        institutions={institutions}
        onChange={setDraft}
        colors={colors}
      />
    </AppBottomSheet>
  );
}
