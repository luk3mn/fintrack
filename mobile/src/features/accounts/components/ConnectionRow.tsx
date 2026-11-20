import { Text, View } from "react-native";
import { connectionUpdatedLabel } from "@/lib/dates";
import type { Connection } from "@/types/domain";

type Props = {
  connection: Connection;
  first: boolean;
};

function initial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function ConnectionRow({ connection, first }: Props) {
  const status = connection.status.toUpperCase();
  const needsAttention = status !== "UPDATED" && status !== "UPDATING";
  const updating = status === "UPDATING";
  const name = connection.institution?.trim() || "Conexão";

  const subtitle = needsAttention
    ? "Reautenticar"
    : updating
      ? "Atualizando…"
      : connectionUpdatedLabel(
          connection.lastUpdatedAt
            ? new Date(connection.lastUpdatedAt)
            : undefined,
        );

  const mark = needsAttention ? "!" : updating ? "…" : "✓";
  const markColor = needsAttention
    ? "text-warm"
    : updating
      ? "text-soft"
      : "text-accent";

  return (
    <View className="flex-row items-center py-[10px]">
      <View
        className={`h-[38px] w-[38px] items-center justify-center rounded-[13px] ${
          first ? "bg-accent" : "bg-tile"
        }`}
      >
        <Text
          className={`text-[13px] font-bold ${
            first ? "text-hero-foreground" : "text-foreground"
          }`}
        >
          {initial(name)}
        </Text>
      </View>

      <View className="flex-1 pl-3">
        <Text
          numberOfLines={1}
          className="text-[13px] font-medium leading-[16px] text-foreground"
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          className={`pt-1 text-[10px] leading-[12px] ${
            needsAttention ? "text-warm" : "text-soft"
          }`}
        >
          {subtitle}
        </Text>
      </View>

      <Text
        className={`pl-3 pr-5 text-[14px] leading-[17px] ${markColor}`}
      >
        {mark}
      </Text>
    </View>
  );
}
