import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, View, type GestureResponderEvent } from "react-native";

type Props = {
  count: number;
  banded?: boolean;
  /** Horizontal padding the chart keeps for its line dots (0 for bar/combo). */
  edge?: number;
  activeIndex: number | null;
  onIndexChange: (index: number | null) => void;
  children: ReactNode;
};

const clampIndex = (value: number, count: number) =>
  Math.max(0, Math.min(count - 1, value));

/**
 * expo-charts keeps a tooltip pinned after a tap, but its own toggle path never
 * runs on native (the press grant already set a non-sticky active point). This
 * overlay takes over taps so the same bar/point opens and closes the tooltip,
 * and another point switches the details in one tap.
 */
export function ChartTapToggle({
  count,
  banded = false,
  edge = 0,
  activeIndex,
  onIndexChange,
  children,
}: Props) {
  const [width, setWidth] = useState(0);

  const indexFromTap = (x: number) => {
    if (count <= 0 || width <= 0) return null;

    const plotWidth = Math.max(width - edge * 2, 10);
    const offset = x - edge;
    const index = banded
      ? Math.floor((offset / plotWidth) * count)
      : Math.round((offset / plotWidth) * (count - 1));

    return clampIndex(index, count);
  };

  const handlePress = (event: GestureResponderEvent) => {
    const index = indexFromTap(event.nativeEvent.locationX);
    if (index === null) return;
    onIndexChange(index === activeIndex ? null : index);
  };

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {children}

      {count > 0 ? (
        <Pressable
          accessible={false}
          onPress={handlePress}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      ) : null}
    </View>
  );
}
