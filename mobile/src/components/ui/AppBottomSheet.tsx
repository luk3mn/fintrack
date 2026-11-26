import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Text, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/tokens";
import { BottomSheet as Sheet } from "./bottom-sheet";
import type { BottomSheetMethods } from "./bottom-sheet/types";

type ContentPaddingObject = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type AppBottomSheetContentPadding = number | ContentPaddingObject;

export type AppBottomSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  children: ReactNode;
  /** Rendered outside the scrollable area and always visible. */
  footer?: ReactNode;
  contentPadding?: AppBottomSheetContentPadding;
  containerColor?: ColorValue;
  /**
   * Caps the sheet height (points or a percentage of the window). Content
   * taller than this scrolls inside the sheet. Defaults to `88%`.
   */
  maxHeight?: string | number;
  /** Allow closing by tapping the backdrop. Defaults to `true`. */
  dismissOnBackdrop?: boolean;
};

// Keep comfortable defaults so content never sticks to the sheet edges. A
// `contentPadding` prop can still override any edge.
const DEFAULT_CONTENT_PADDING = {
  top: 8,
  right: 16,
  bottom: 12,
  left: 16,
} as const;

function resolveContentPadding(
  value: AppBottomSheetContentPadding | undefined,
  bottomInset: number,
) {
  const base =
    typeof value === "number"
      ? { top: value, right: value, bottom: value, left: value }
      : (value ?? {});

  return {
    top: base.top ?? DEFAULT_CONTENT_PADDING.top,
    right: base.right ?? DEFAULT_CONTENT_PADDING.right,
    bottom: (base.bottom ?? DEFAULT_CONTENT_PADDING.bottom) + bottomInset,
    left: base.left ?? DEFAULT_CONTENT_PADDING.left,
  };
}

/**
 * App preset on top of the generic sheet in `./bottom-sheet`.
 *
 * The generic component is imperative (ref + `snapToIndex`/`close`); screens
 * use a simple `visible` boolean. This component owns that translation plus
 * the shared theme, title and footer layout, so each screen stays declarative.
 */
export function AppBottomSheet({
  visible,
  onDismiss,
  title,
  subtitle,
  header,
  children,
  footer,
  contentPadding,
  containerColor,
  maxHeight = "88%",
  dismissOnBackdrop = true,
}: AppBottomSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const wasVisible = useRef(false);
  const padding = resolveContentPadding(contentPadding, insets.bottom);
  const hasHeader = Boolean(header || title || subtitle);
  const footerBottomPadding = Math.max(0, padding.bottom - insets.bottom);

  const handleClose = useCallback(() => {
    wasVisible.current = false;
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      wasVisible.current = true;
      sheetRef.current?.snapToIndex(0);
    } else if (wasVisible.current) {
      wasVisible.current = false;
      sheetRef.current?.close();
    }
  }, [visible]);

  return (
    <Sheet
      ref={sheetRef}
      enableDynamicSizing
      maxDynamicContentSize={maxHeight}
      onClose={handleClose}
      dismissOnBackdropPress={dismissOnBackdrop}
      backgroundColor={
        (containerColor as string | undefined) ?? colors.background
      }
      handleStyle={{ backgroundColor: colors.muted }}
      footer={
        footer ? (
          <View
            style={{
              paddingTop: 12,
              paddingRight: padding.right,
              paddingBottom: footerBottomPadding,
              paddingLeft: padding.left,
            }}
          >
            {footer}
          </View>
        ) : undefined
      }
    >
      <View
        style={{
          paddingTop: padding.top,
          paddingRight: padding.right,
          // The sheet adds the bottom safe-area spacer itself when there is no
          // footer, so only the base padding is applied here.
          paddingBottom: footer ? 0 : footerBottomPadding,
          paddingLeft: padding.left,
          gap: 16,
        }}
      >
        {hasHeader ? (
          <View>
            {header ?? (
              <>
                {title ? (
                  <Text
                    className="text-base font-semibold text-foreground"
                    style={{ color: colors.foreground }}
                  >
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text
                    className="pt-1 text-xs"
                    style={{ color: colors.muted }}
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        {children}
      </View>
    </Sheet>
  );
}
