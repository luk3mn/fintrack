import { Text, View } from "react-native";

type Props = {
  lastSync?: Date;
};

function relativeTime(date?: Date) {
  if (!date) return "Nunca sincronizado";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (minutes < 1) return "Atualizado agora";
  if (minutes < 60) return `Atualizado há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Atualizado há ${hours} h`;

  return `Atualizado há ${Math.floor(hours / 24)} d`;
}

export function OverviewHeader({ lastSync }: Props) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      <View className="px-1">
        <Text className="text-[23px] font-semibold text-foreground">
          Visão geral
        </Text>
      </View>

      <View className="mt-1 flex-row justify-end">
        <View className="mr-1 h-[25px] flex-row items-center rounded-[13px] bg-card px-3">
          <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-warm" />
          <Text className="text-[10px] text-soft">{relativeTime(lastSync)}</Text>
        </View>
      </View>
    </View>
  );
}
