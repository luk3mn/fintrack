import { Text } from "react-native";

type Props = {
  title: string;
};

export function SectionTitle({ title }: Props) {
  return (
    <Text className="text-lg font-semibold text-foreground">
      {title}
    </Text>
  );
}
