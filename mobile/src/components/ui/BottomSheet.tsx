import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/tokens";

type ContentPaddingObject = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type BottomSheetContentPadding = number | ContentPaddingObject;

export type BottomSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  children: ReactNode;
  contentPadding?: BottomSheetContentPadding;
  containerColor?: ColorValue;
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

const MAX_SHEET_HEIGHT = "88%";

function resolveContentPadding(
  value: BottomSheetContentPadding | undefined,
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
 * App-standard bottom sheet built on React Native's `Modal`.
 *
 * It intentionally avoids `@expo/ui`'s native sheet: putting RN touchables or
 * a RN `ScrollView` inside the Compose/SwiftUI sheet breaks scrolling and taps.
 * A plain `Modal` keeps gestures fully in React Native on every platform.
 */
export function BottomSheet({
  visible,
  onDismiss,
  title,
  subtitle,
  header,
  children,
  contentPadding,
  containerColor,
  dismissOnBackdrop = true,
}: BottomSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const padding = resolveContentPadding(contentPadding, insets.bottom);
  const hasHeader = Boolean(header || title || subtitle);

  return (
    <Modal
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          disabled={!dismissOnBackdrop}
          onPress={onDismiss}
          style={[styles.backdrop, !dismissOnBackdrop && styles.backdropStatic]}
        />

        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: containerColor ?? colors.background,
              paddingTop: padding.top,
              paddingRight: padding.right,
              paddingBottom: padding.bottom,
              paddingLeft: padding.left,
            },
          ]}
        >
          <View style={styles.dragIndicator} />

          {hasHeader ? (
            <View style={styles.header}>
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

          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropStatic: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  sheet: {
    maxHeight: MAX_SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexShrink: 1,
  },
  dragIndicator: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    backgroundColor: "rgba(128, 128, 128, 0.45)",
  },
  header: {
    paddingBottom: 16,
  },
  content: {
    flexShrink: 1,
    minHeight: 0,
    gap: 16,
  },
});
