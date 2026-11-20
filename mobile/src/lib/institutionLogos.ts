import type { ImageSourcePropType } from "react-native";

const LOGOS: Record<string, ImageSourcePropType> = {
  nubank: require("../../assets/images/institutions/nubank.png"),
  "banco inter": require("../../assets/images/institutions/inter.png"),
  "mercado pago": require("../../assets/images/institutions/mercadopago.png"),
};

export function institutionLogo(
  institution?: string,
): ImageSourcePropType | undefined {
  if (!institution) return undefined;

  return LOGOS[institution.trim().toLowerCase()];
}
