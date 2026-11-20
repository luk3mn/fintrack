import { Image, Text, View } from "react-native";
import { institutionLogo } from "@/lib/institutionLogos";

type Props = {
  institution?: string;
  name: string;
  first: boolean;
};

function initial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function InstitutionLogo({ institution, name, first }: Props) {
  const logo = institutionLogo(institution);

  if (logo) {
    return (
      <Image
        source={logo}
        style={{ width: 38, height: 38, borderRadius: 13 }}
        resizeMode="cover"
      />
    );
  }

  return (
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
  );
}
