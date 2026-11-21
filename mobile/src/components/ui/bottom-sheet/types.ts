import type { ReactNode } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated"

export type BottomSheetMethods = {
  snapToIndex: (index: number) => void
  snapToPosition: (position: number) => void
  expand: () => void
  collapse: () => void
  close: () => void
  getCurrentIndex: () => number
}

/** A height in points, or a percentage of the window height ("70%"). */
export type SheetSize = string | number

type SizingProps =
  | {
      snapPoints: SheetSize[]
      enableDynamicSizing?: false
      maxDynamicContentSize?: never
    }
  | {
      snapPoints?: never
      /**
       * The sheet opens at the height of its content, measured through the
       * sheet's ScrollView, so it follows the device's font scale and long
       * text; past `maxDynamicContentSize` the content scrolls.
       */
      enableDynamicSizing: true
      /** Defaults to the window height below the status bar. */
      maxDynamicContentSize?: SheetSize
      /** The content is measured through the sheet's own scroll view. */
      contentScrollEnabled?: true
    }

export type BottomSheetProps = SizingProps & {
  children: ReactNode
  /** Kept outside the scroll area, so it stays visible while content scrolls. */
  footer?: ReactNode
  enableBackdrop?: boolean
  backdropOpacity?: number
  dismissOnBackdropPress?: boolean
  dismissOnSwipeDown?: boolean
  onSnapPointChange?: (index: number) => void
  onClose?: () => void
  springConfig?: WithSpringConfig
  sheetStyle?: StyleProp<ViewStyle>
  backdropStyle?: StyleProp<ViewStyle>
  handleStyle?: StyleProp<ViewStyle>
  showHandle?: boolean
  enableOverDrag?: boolean
  enableHapticFeedback?: boolean
  snapVelocityThreshold?: number
  backgroundColor?: string
  borderRadius?: number
  contentContainerStyle?: StyleProp<ViewStyle>
  /**
   * When false, children are laid out in a flex View with no internal ScrollView
   * and no content pan gesture — so a nested FlatList can scroll freely.
   * Dismiss still works via handle + backdrop. Default true.
   */
  contentScrollEnabled?: boolean
}

export type { WithTimingConfig }
