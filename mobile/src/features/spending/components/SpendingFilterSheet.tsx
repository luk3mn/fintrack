import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { Button } from "@/components/ui/Button";
import {
  SPENDING_MONTHS,
  SPENDING_PERIODS,
  type SpendingPeriod,
} from "@/lib/spending";
import { useThemeColors } from "@/theme/tokens";

export type SpendingFilterValue = {
  period: SpendingPeriod;
  month: number;
  /** `null` means all categories. */
  category: string | null;
};

type Props = {
  visible: boolean;
  value: SpendingFilterValue;
  categories: string[];
  onApply: (value: SpendingFilterValue) => void;
  onDismiss: () => void;
};

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();

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

function SectionLabel({ label }: { label: string }) {
  const colors = useThemeColors();

  return (
    <Text
      className="text-xs font-semibold uppercase tracking-wide"
      style={{ color: colors.muted }}
    >
      {label}
    </Text>
  );
}

export function SpendingFilterSheet({
  visible,
  value,
  categories,
  onApply,
  onDismiss,
}: Props) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState<SpendingFilterValue>(value);
  const [wasVisible, setWasVisible] = useState(visible);

  // Each opening starts from the filter currently applied to the screen.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Filtrar gastos"
      subtitle="Escolha período, mês e categoria. Por padrão, mostra tudo."
      maxHeight="80%"
      footer={
        <Button
          title="Aplicar filtros"
          onPress={() => {
            onApply(draft);
            onDismiss();
          }}
        />
      }
    >
      <View className="gap-5">
        <View className="gap-2">
          <SectionLabel label="Período" />
          {SPENDING_PERIODS.map((option) => (
            <OptionRow
              key={option.key}
              label={option.label}
              selected={draft.period === option.key}
              onPress={() =>
                setDraft((current) => ({ ...current, period: option.key }))
              }
            />
          ))}
        </View>

        {draft.period === "month" ? (
          <View className="gap-2">
            <SectionLabel label="Mês" />
            <View className="flex-row flex-wrap gap-2">
              {SPENDING_MONTHS.map((option) => {
                const selected = option.index === draft.month;

                return (
                  <Pressable
                    key={option.index}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.fullLabel}
                    onPress={() =>
                      setDraft((current) => ({
                        ...current,
                        month: option.index,
                      }))
                    }
                    className="rounded-xl px-2 py-2 active:opacity-70"
                    style={{
                      flexBasis: "15%",
                      flexGrow: 1,
                      backgroundColor: selected ? colors.primary : colors.card,
                    }}
                  >
                    <Text
                      className="text-center text-xs font-medium"
                      style={{
                        color: selected
                          ? colors.primaryForeground
                          : colors.foreground,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="gap-2">
          <SectionLabel label="Categoria" />
          <OptionRow
            label="Todas as categorias"
            selected={draft.category === null}
            onPress={() =>
              setDraft((current) => ({ ...current, category: null }))
            }
          />
          {categories.map((name) => (
            <OptionRow
              key={name}
              label={name}
              selected={draft.category === name}
              onPress={() =>
                setDraft((current) => ({ ...current, category: name }))
              }
            />
          ))}
        </View>
      </View>
    </AppBottomSheet>
  );
}
