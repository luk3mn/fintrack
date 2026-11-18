import { Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, ...props }: Props) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-zinc-300">{label}</Text>
      <TextInput
        placeholderTextColor="#71717a"
        className={`h-12 rounded-xl border bg-zinc-900 px-4 text-base text-zinc-50 ${error ? "border-red-500" : "border-zinc-800"}`}
        {...props}
      />
      {error ? <Text className="text-sm text-red-400">{error}</Text> : null}
    </View>
  );
}
