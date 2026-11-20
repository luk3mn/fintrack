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
      <Text className="text-[17px] font-semibold text-foreground">{title}</Text>
      {action ? (
        <Text
          className={`text-[10px] text-accent ${
            actionCaps ? "font-medium uppercase tracking-[0.5px]" : "font-normal"
          }`}
        >
          {action}  ↗
        </Text>
      ) : null}
    </View>
  );
}
