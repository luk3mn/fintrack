import { Text, View } from "react-native";

type Props = {
  title: string;
  action?: string;
  actionCaps?: boolean;
};

export function SectionHeader({
  title,
  action,
  actionCaps = false,
}: Props) {
  return (
    <View className="flex-row items-end justify-between px-1">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      {action ? (
        <Text
          className={`text-xs text-accent ${
            actionCaps ? "font-medium uppercase tracking-wide" : "font-normal"
          }`}
        >
          {action}  ↗
        </Text>
      ) : null}
    </View>
  );
}
