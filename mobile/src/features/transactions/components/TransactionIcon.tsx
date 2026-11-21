import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import type { TransactionIconKey } from "@/lib/transactions";

type Props = {
  name: TransactionIconKey;
  label?: string;
  size?: number;
};

/**
 * Transaction illustrations drawn as SVGs. Every glyph sits on a white tile
 * so brand colours stay recognisable in both the light and dark app themes.
 */
const GLYPHS: Record<TransactionIconKey, ReactNode> = {
  youtube: (
    <G>
      <Rect x="1.5" y="5" width="21" height="14" rx="4" fill="#FF0033" />
      <Path d="M10 8.4v7.2l6-3.6z" fill="#FFFFFF" />
    </G>
  ),
  ifood: (
    <G>
      <Rect x="2" y="2" width="20" height="20" rx="6" fill="#EA1D2C" />
      <Path
        d="M10 7v8"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <Circle cx="10" cy="18" r="1.5" fill="#FFFFFF" />
    </G>
  ),
  uber: (
    <G>
      <Path d="M4 15l2-5h12l2 5v3h-2v-1.5H6V18H4z" fill="#111827" />
      <Circle cx="7.5" cy="15" r="1.1" fill="#FFFFFF" />
      <Circle cx="16.5" cy="15" r="1.1" fill="#FFFFFF" />
    </G>
  ),
  netflix: (
    <Path
      d="M6.5 3v18M17.5 3v18M6.5 3l11 18"
      stroke="#E50914"
      strokeWidth="3"
      strokeLinecap="square"
      fill="none"
    />
  ),
  spotify: (
    <G>
      <Circle cx="12" cy="12" r="10" fill="#1DB954" />
      <Path
        d="M6.7 9.4c3.8-1.1 8.3-.8 11.5 1.1"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M7.2 12.5c3.2-.9 6.9-.6 9.6 1"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M7.8 15.5c2.6-.7 5.4-.5 7.6.9"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </G>
  ),
  mercadoPago: (
    <G>
      <Circle cx="12" cy="12" r="10" fill="#00ADEF" />
      <Path
        d="M5.5 13.2c3.2-2.6 6-3 8.5-1.2 1.3 1 2.8 1 4.5.2"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M8 16.5c2.4-1.1 4.4-1 6 .3"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </G>
  ),
  pix: (
    <G fill="#32BCAD">
      <Path d="M12 2.5l3.6 3.6L12 9.7 8.4 6.1z" />
      <Path d="M21.5 12l-3.6 3.6-3.6-3.6 3.6-3.6z" />
      <Path d="M12 21.5l-3.6-3.6 3.6-3.6 3.6 3.6z" />
      <Path d="M2.5 12l3.6-3.6 3.6 3.6-3.6 3.6z" />
    </G>
  ),
  transfer: (
    <Path
      d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"
      stroke="#0EA5A4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  groceries: (
    <G
      stroke="#2E9E5B"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M3 5h2.2l2.4 10.2a1.8 1.8 0 0 0 1.8 1.4h8.2a1.8 1.8 0 0 0 1.8-1.4L21 8H6.2" />
      <Circle cx="10" cy="20" r="1.2" fill="#2E9E5B" stroke="none" />
      <Circle cx="17" cy="20" r="1.2" fill="#2E9E5B" stroke="none" />
    </G>
  ),
  restaurant: (
    <G
      stroke="#F59E0B"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    >
      <Path d="M7 3v6.5a2.5 2.5 0 0 0 5 0V3M9.5 12v9" />
      <Path d="M17 3c-1.8 0-2.6 2.4-2.6 5.5S15.2 13 17 13v8" />
    </G>
  ),
  car: (
    <G>
      <Path d="M4 15l2-5h12l2 5v3h-2v-1.5H6V18H4z" fill="#2563EB" />
      <Circle cx="7.5" cy="15" r="1.1" fill="#FFFFFF" />
      <Circle cx="16.5" cy="15" r="1.1" fill="#FFFFFF" />
    </G>
  ),
  home: (
    <G
      stroke="#8B5CF6"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M3.5 11L12 4l8.5 7" />
      <Path d="M6 9.5V20h12V9.5" />
      <Rect x="10" y="14" width="4" height="6" fill="#8B5CF6" stroke="none" />
    </G>
  ),
  invoice: (
    <G
      stroke="#7C3AED"
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="none"
    >
      <Rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <Path d="M2.5 9.5h19" />
      <Path d="M6 15h4" strokeLinecap="round" />
    </G>
  ),
  investment: (
    <G
      stroke="#4F46E5"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M4 4v16h16" />
      <Path d="M7 15l4-4 3 2.5 5-6" />
      <Path d="M16 7.5h3v3" />
    </G>
  ),
  income: (
    <G
      stroke="#16A34A"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M12 3v12" />
      <Path d="M7 11l5 5 5-5" />
      <Path d="M4 20h16" />
    </G>
  ),
  yield: (
    <G>
      <G
        stroke="#16A34A"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Ellipse cx="12" cy="17.5" rx="8" ry="2.5" fill="#DCFCE7" />
        <Path d="M4 17.5v-3c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v3" />
        <Path d="M4 14.5v-3c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v3" />
        <Ellipse cx="12" cy="11.5" rx="8" ry="2.5" fill="#DCFCE7" />
      </G>
      <Path
        d="M12 9V3.5M9.5 6L12 3.5 14.5 6"
        stroke="#16A34A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  ),
  services: (
    <G stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" fill="none">
      <Path d="M4 7h16M4 12h16M4 17h16" />
      <Circle cx="9" cy="7" r="2.2" fill="#FFFFFF" />
      <Circle cx="15" cy="12" r="2.2" fill="#FFFFFF" />
      <Circle cx="8" cy="17" r="2.2" fill="#FFFFFF" />
    </G>
  ),
  shopping: (
    <G
      stroke="#F59E0B"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M5 8h14l-1 12H6z" />
      <Path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </G>
  ),
  receipt: (
    <G
      stroke="#64748B"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z" />
      <Path d="M9 8h6M9 12h6" />
    </G>
  ),
};

export function TransactionIcon({ name, label, size = 40 }: Props) {
  return (
    <View
      accessible
      accessibilityLabel={label ?? name}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 0.07)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        {GLYPHS[name]}
      </Svg>
    </View>
  );
}
