import type { ComponentProps, ReactNode } from "react";
import { Platform, Text, View } from "react-native";
import { BottomSheet as ExpoBottomSheet } from "@expo/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/tokens";

type ExpoSheetProps = ComponentProps<typeof ExpoBottomSheet>;
type ContentPadding = ExpoSheetProps["contentPadding"];

export type BottomSheetProps = Omit<
  ExpoSheetProps,
  "isPresented" | "children" | "contentPadding" | "containerColor"
> & {
  visible: boolean;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  children: ReactNode;
  contentPadding?: ContentPadding;
};

// Keep the platform defaults (16px on iOS/Android) so content never sticks to
// the sheet edges. A `contentPadding` prop can still override any edge.
const DEFAULT_CONTENT_PADDING = {
  top: 8,
  right: 16,
  bottom: 12,
  left: 16,
} as const;

function resolveContentPadding(
  value: ContentPadding,
  bottomInset: number,
): Exclude<ContentPadding, number> {
  const base =
    typeof value === "number"
      ? { top: value, right: value, bottom: value, left: value }
      : value ?? {};

  return {
    top: base.top ?? DEFAULT_CONTENT_PADDING.top,
    right: base.right ?? DEFAULT_CONTENT_PADDING.right,
    bottom: (base.bottom ?? DEFAULT_CONTENT_PADDING.bottom) + bottomInset,
    left: base.left ?? DEFAULT_CONTENT_PADDING.left,
  };
}

/**
 * App-standard bottom sheet with theme-aware background, safe-area padding and
 * an optional title/subtitle header. Use `header` for fully custom headers.
 */
export function BottomSheet({
  visible,
  title,
  subtitle,
  header,
  children,
  contentPadding,
  ...sheetProps
}: BottomSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const hasHeader = Boolean(header || title || subtitle);

  return (
    <ExpoBottomSheet
      {...sheetProps}
      isPresented={visible}
      containerColor={colors.background}
      contentPadding={resolveContentPadding(contentPadding, insets.bottom)}
    >
      {/* Android's @expo/ui sheet does not apply the right contentPadding to
          React Native children, so keep the tree inside the visible edge. */}
      <View
        className="gap-4"
        style={{ paddingRight: Platform.OS === "android" ? 30 : 0 }}
      >
        {hasHeader ? (
          <View>
            {header ?? (
              <>
                {title ? (
                  <Text className="text-base font-semibold text-foreground">
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text className="pt-1 text-xs text-muted">{subtitle}</Text>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        {children}
      </View>
    </ExpoBottomSheet>
  );
}
