import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  action?: string;
  actionCaps?: boolean;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  action,
  actionCaps = false,
  onAction,
}: Props) {
  const label = (
    <Text
      className={`text-xs text-accent ${
        actionCaps ? "font-medium uppercase tracking-wide" : "font-normal"
      }`}
    >
      {action} ↗
    </Text>
  );

  return (
    <View className="flex-row items-end justify-between px-1">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      {action ? (
        onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            className="active:opacity-60"
          >
            {label}
          </Pressable>
        ) : (
          label
        )
      ) : null}
    </View>
  );
}
