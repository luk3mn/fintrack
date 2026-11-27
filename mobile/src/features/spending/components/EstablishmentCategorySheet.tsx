import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import { Button } from "@/components/ui/Button";
import { SPENDING_CATEGORY_OPTIONS } from "@/lib/categories";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  visible: boolean;
  name: string;
  currentCategory: string;
  hasRule: boolean;
  onDismiss: () => void;
  onSave: (category: string) => void;
  onRemove: () => void;
};

export function EstablishmentCategorySheet({
  visible,
  name,
  currentCategory,
  hasRule,
  onDismiss,
  onSave,
  onRemove,
}: Props) {
  const colors = useThemeColors();
  // Reset the draft whenever a different establishment is opened without an
  // effect: the value is derived from the props that identify the current edit.
  const editKey = `${visible}\u0000${name}\u0000${currentCategory}`;
  const [draftState, setDraftState] = useState(() => ({
    key: editKey,
    value: currentCategory,
  }));
  const draft = draftState.key === editKey ? draftState.value : currentCategory;
  const setDraft = (value: string) => setDraftState({ key: editKey, value });

  const save = () => {
    const category = draft.trim();
    if (!category) return;
    Keyboard.dismiss();
    onSave(category);
    onDismiss();
  };

  const remove = () => {
    Keyboard.dismiss();
    onRemove();
    onDismiss();
  };

  return (
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={name}
      subtitle="A categoria será aplicada também às próximas transações deste nome."
      maxHeight="70%"
      footer={
        <View className="flex-row gap-2">
          {hasRule ? (
            <View className="flex-1">
              <Button title="Remover" variant="secondary" onPress={remove} />
            </View>
          ) : null}
          <View className="flex-1">
            <Button
              title="Salvar"
              onPress={save}
              disabled={draft.trim().length === 0}
            />
          </View>
        </View>
      }
    >
      <View>
        <Text className="text-xs text-muted">
          Categoria atual: {currentCategory || "sem categoria"}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {SPENDING_CATEGORY_OPTIONS.map((option) => {
          const selected =
            draft.trim().toLocaleLowerCase() === option.toLocaleLowerCase();

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setDraft(option)}
              className="flex-row items-center gap-1.5 rounded-full px-3 py-2 active:opacity-70"
              style={{
                backgroundColor: selected ? colors.primary : colors.card,
              }}
            >
              {selected ? (
                <Ionicons
                  name="checkmark"
                  size={13}
                  color={colors.primaryForeground}
                />
              ) : null}
              <Text
                className="text-xs font-medium"
                style={{
                  color: selected
                    ? colors.primaryForeground
                    : colors.foreground,
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View>
        <Text className="pb-2 text-xs text-muted">Ou crie uma categoria</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ex.: Aluguel"
          placeholderTextColor={colors.muted}
          numberOfLines={1}
          className="rounded-xl border px-3 py-2.5 text-sm text-foreground"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        />
      </View>
    </AppBottomSheet>
  );
}
