import { isValidElement, type ReactElement, type ReactNode } from "react"
import * as Haptics from "expo-haptics"
import type { SheetSize } from "./types"

export function parseSnapPoint(point: SheetSize, windowHeight: number): number {
  if (typeof point === "number") return point
  if (point.endsWith("%")) {
    return (windowHeight * Number.parseFloat(point)) / 100
  }
  return Number.parseFloat(point)
}

export function triggerHaptic() {
  if (process.env.EXPO_OS === "ios") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
}

const SCROLLABLE_TYPES = new Set([
  "ScrollView",
  "FlatList",
  "SectionList",
  "FlashList",
  "AnimatedScrollView",
])

export function isScrollableList(node: ReactNode): node is ReactElement {
  if (!isValidElement(node)) return false
  const type = node.type as { displayName?: string; name?: string }
  const name = type.displayName ?? type.name ?? ""
  if (SCROLLABLE_TYPES.has(name)) return true
  // Reanimated / animated wrappers: "AnimatedFlatList", "Animated(FlatList)", etc.
  return /FlatList|SectionList|ScrollView|FlashList/.test(name)
}
