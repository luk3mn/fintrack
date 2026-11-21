import React, {
  Children,
  cloneElement,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react"
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from "react-native"
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { scheduleOnRN } from "react-native-worklets"

import {
  DEFAULT_SPRING_CONFIG,
  DEFAULT_TIMING_CONFIG,
  HANDLE_HEIGHT,
  SCROLL_TOP_THRESHOLD,
} from "./conf"
import type { BottomSheetMethods, BottomSheetProps } from "./types"
import { isScrollableList, parseSnapPoint, triggerHaptic } from "./utils"

const BottomSheetComponent = forwardRef<BottomSheetMethods, BottomSheetProps>(
  (
    {
      children,
      footer,
      snapPoints,
      enableDynamicSizing = false,
      maxDynamicContentSize,
      enableBackdrop = true,
      backdropOpacity = 0.45,
      dismissOnBackdropPress = true,
      dismissOnSwipeDown = true,
      onSnapPointChange,
      onClose,
      springConfig = DEFAULT_SPRING_CONFIG,
      sheetStyle,
      backdropStyle,
      handleStyle,
      showHandle = true,
      enableOverDrag = true,
      enableHapticFeedback = true,
      snapVelocityThreshold = 500,
      backgroundColor = "#FFFFFF",
      borderRadius = 24,
      contentContainerStyle,
      contentScrollEnabled = true,
    },
    ref
  ) => {
    // Read on every render, so rotation, split screen and a new status bar
    // height move the sheet instead of a size frozen at import time.
    const { height: windowHeight } = useWindowDimensions()
    const insets = useSafeAreaInsets()
    const handleHeight = showHandle ? HANDLE_HEIGHT : 0

    // Dynamic sizing: the content's laid-out height (bottom safe-area spacer
    // included), null until the sheet has been laid out once.
    const [contentHeight, setContentHeight] = useState<number | null>(null)
    const [footerHeight, setFooterHeight] = useState(0)
    const maxDynamicSize = Math.min(
      parseSnapPoint(
        maxDynamicContentSize ?? windowHeight - insets.top,
        windowHeight
      ),
      windowHeight - insets.top
    )
    const dynamicSnapPoint = Math.min(
      maxDynamicSize,
      (contentHeight ?? maxDynamicSize) + footerHeight + handleHeight
    )
    // Wait only for the content; the footer height arrives right after and the
    // re-snap effect below adjusts the sheet if it was measured after opening.
    const sizeReady = !enableDynamicSizing || contentHeight !== null
    const handleContentSizeChange = useCallback(
      (_width: number, height: number) => setContentHeight(Math.ceil(height)),
      []
    )
    const handleFooterLayout = useCallback(
      (height: number) => setFooterHeight(Math.ceil(height)),
      []
    )

    // Value equality: callers pass a fresh array every render (`snapPoints={["68%"]}`).
    // Depending on the array reference recreates the pan gesture and delays the next tap.
    const snapPointsKey = enableDynamicSizing
      ? String(dynamicSnapPoint)
      : (snapPoints ?? []).map(String).join("|")
    const snapPointsRef = useRef(snapPoints)
    snapPointsRef.current = snapPoints
    const parsedSnapPoints = useMemo(
      () =>
        enableDynamicSizing
          ? [dynamicSnapPoint]
          : (snapPointsRef.current ?? []).map((point) =>
              parseSnapPoint(point, windowHeight)
            ),
      // `snapPointsKey` is a value-based trigger: the array itself lives in a
      // ref, so callers may pass a fresh array on every render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [dynamicSnapPoint, enableDynamicSizing, snapPointsKey, windowHeight]
    )
    const maxSnapPoint = useMemo(
      () => Math.max(...parsedSnapPoints),
      [parsedSnapPoints]
    )
    const minSnapPoint = useMemo(
      () => Math.min(...parsedSnapPoints),
      [parsedSnapPoints]
    )
    const maxSnapIndex = parsedSnapPoints.length - 1

    const translateY = useSharedValue(windowHeight)
    const currentSnapIndex = useSharedValue(-1)
    const context = useSharedValue(0)
    const scrollY = useSharedValue(0)
    const scrollViewRef = useAnimatedRef<Animated.ScrollView>()
    const isDraggingSheet = useSharedValue(false)
    const gestureStartScrollY = useSharedValue(0)
    const [enableScroll, setEnableScroll] = useState(
      () => parsedSnapPoints.length === 1
    )
    const [modalVisible, setModalVisible] = useState(false)
    const pendingSnapIndex = useRef<number | null>(null)
    const onSnapPointChangeRef = useRef(onSnapPointChange)
    const onCloseRef = useRef(onClose)
    onSnapPointChangeRef.current = onSnapPointChange
    onCloseRef.current = onClose

    const handleSnapPointChangeJS = useCallback(
      (index: number) => {
        if (enableHapticFeedback) triggerHaptic()
        onSnapPointChangeRef.current?.(index)
      },
      [enableHapticFeedback]
    )

    const handleCloseJS = useCallback(() => {
      if (enableHapticFeedback) triggerHaptic()
      onCloseRef.current?.()
    }, [enableHapticFeedback])

    const hideModalJS = useCallback(() => {
      setModalVisible(false)
      handleCloseJS()
    }, [handleCloseJS])

    const updateScrollEnabled = useCallback((enabled: boolean) => {
      setEnableScroll(enabled)
    }, [])

    const findClosestSnapPoint = useCallback(
      (currentY: number, velocity: number): number => {
        "worklet"
        const height = windowHeight - currentY
        if (Math.abs(velocity) > snapVelocityThreshold) {
          const direction = velocity > 0 ? -1 : 1
          const nextIndex = currentSnapIndex.value + direction
          if (nextIndex >= 0 && nextIndex < parsedSnapPoints.length) {
            return nextIndex
          }
        }
        let closestIndex = 0
        let minDistance = Math.abs(height - parsedSnapPoints[0])
        for (let i = 1; i < parsedSnapPoints.length; i++) {
          const distance = Math.abs(height - parsedSnapPoints[i])
          if (distance < minDistance) {
            minDistance = distance
            closestIndex = i
          }
        }
        return closestIndex
      },
      [parsedSnapPoints, snapVelocityThreshold, currentSnapIndex, windowHeight]
    )

    const snapToPoint = useCallback(
      (index: number, animated = true) => {
        "worklet"
        if (index < 0 || index >= parsedSnapPoints.length) return
        const targetY = windowHeight - parsedSnapPoints[index]
        translateY.value = animated
          ? withSpring(targetY, springConfig)
          : targetY
        currentSnapIndex.value = index
        const shouldEnableScroll = index === maxSnapIndex
        scheduleOnRN(updateScrollEnabled, shouldEnableScroll)
        // Always schedule the stable JS callback. It reads onSnapPointChange
        // from a ref, so this worklet does not depend on the prop identity —
        // a new callback from the parent must not rebuild the pan gesture.
        scheduleOnRN(handleSnapPointChangeJS, index)
      },
      [
        parsedSnapPoints,
        springConfig,
        translateY,
        currentSnapIndex,
        maxSnapIndex,
        handleSnapPointChangeJS,
        updateScrollEnabled,
        windowHeight,
      ]
    )

    const presentAtIndex = useCallback(
      (index: number) => {
        pendingSnapIndex.current = index
        if (modalVisible) {
          snapToPoint(index, true)
          pendingSnapIndex.current = null
          return
        }
        // Start below the current window, which may have changed while hidden.
        translateY.value = windowHeight
        setModalVisible(true)
      },
      [modalVisible, snapToPoint, translateY, windowHeight]
    )

    // With dynamic sizing, wait for the first measurement of the content
    // (it only mounts once the Modal is visible) before sliding up.
    useEffect(() => {
      if (!modalVisible || !sizeReady || pendingSnapIndex.current === null)
        return
      const index = pendingSnapIndex.current
      pendingSnapIndex.current = null
      const frame = requestAnimationFrame(() => {
        snapToPoint(index, true)
      })
      return () => cancelAnimationFrame(frame)
    }, [modalVisible, sizeReady, snapToPoint])

    // Snap points that change while the sheet is open (content refetched,
    // font scale, window resized) move it to the new height.
    useEffect(() => {
      const index = currentSnapIndex.value
      if (!modalVisible || index < 0 || isDraggingSheet.value) return
      const target = Math.min(index, parsedSnapPoints.length - 1)
      translateY.value = withSpring(
        windowHeight - parsedSnapPoints[target],
        springConfig
      )
    }, [
      parsedSnapPoints,
      windowHeight,
      modalVisible,
      currentSnapIndex,
      isDraggingSheet,
      translateY,
      springConfig,
    ])

    const closeSheet = useCallback(() => {
      "worklet"
      scheduleOnRN(updateScrollEnabled, false)
      // Mark it closed now, so the re-snap above can't reopen it mid-animation.
      currentSnapIndex.value = -1
      translateY.value = withTiming(
        windowHeight,
        DEFAULT_TIMING_CONFIG,
        (finished) => {
          if (finished) {
            scrollY.value = 0
            // Avoid scrollTo on an unbound animated ref (FlatList child path).
            // Modal unmount resets ScrollView offset on the next open.
            scheduleOnRN(hideModalJS)
          }
        }
      )
    }, [
      translateY,
      hideModalJS,
      scrollY,
      updateScrollEnabled,
      currentSnapIndex,
      windowHeight,
    ])

    const onScroll = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y
      },
    })

    const handlePanGesture = useMemo(
      () =>
        Gesture.Pan()
          .onBegin(() => {
            context.value = translateY.value
            isDraggingSheet.value = true
          })
          .onUpdate((event) => {
            const newY = context.value + event.translationY
            const minY = windowHeight - maxSnapPoint
            const maxY = windowHeight
            if (enableOverDrag) {
              if (newY < minY) {
                translateY.value = minY - Math.log(minY - newY + 1) * 10
              } else if (newY > maxY) {
                translateY.value = maxY + Math.log(newY - maxY + 1) * 10
              } else {
                translateY.value = newY
              }
            } else {
              translateY.value = Math.max(minY, Math.min(maxY, newY))
            }
          })
          .onEnd((event) => {
            isDraggingSheet.value = false
            if (
              dismissOnSwipeDown &&
              translateY.value > windowHeight - minSnapPoint &&
              event.velocityY > 500
            ) {
              closeSheet()
              return
            }
            snapToPoint(
              findClosestSnapPoint(translateY.value, event.velocityY),
              true
            )
          }),
      [
        translateY,
        context,
        isDraggingSheet,
        enableOverDrag,
        maxSnapPoint,
        minSnapPoint,
        dismissOnSwipeDown,
        closeSheet,
        findClosestSnapPoint,
        snapToPoint,
        windowHeight,
      ]
    )

    const contentPanGesture = useMemo(
      () =>
        Gesture.Pan()
          .activeOffsetY([-10, 10])
          .onStart(() => {
            context.value = translateY.value
            gestureStartScrollY.value = scrollY.value
            isDraggingSheet.value = false
          })
          .onUpdate((event) => {
            const isFullyExpanded = currentSnapIndex.value === maxSnapIndex
            if (!isFullyExpanded) {
              isDraggingSheet.value = true
              const newY = context.value + event.translationY
              const minY = windowHeight - maxSnapPoint
              const maxY = windowHeight
              if (newY < minY) {
                translateY.value = enableOverDrag
                  ? minY - Math.log(minY - newY + 1) * 10
                  : minY
              } else if (newY > maxY) {
                translateY.value = enableOverDrag
                  ? maxY + Math.log(newY - maxY + 1) * 10
                  : maxY
              } else {
                translateY.value = newY
              }
              return
            }
            const isAtTop = scrollY.value <= SCROLL_TOP_THRESHOLD
            const isDraggingDown = event.translationY > 0
            const wasAtTopAtStart =
              gestureStartScrollY.value <= SCROLL_TOP_THRESHOLD
            if (
              !(
                isDraggingSheet.value ||
                (isAtTop && isDraggingDown && wasAtTopAtStart)
              )
            ) {
              return
            }
            isDraggingSheet.value = true
            const newY = context.value + event.translationY
            const minY = windowHeight - maxSnapPoint
            const maxY = windowHeight
            if (newY < minY) {
              translateY.value = enableOverDrag
                ? minY - Math.log(minY - newY + 1) * 10
                : minY
            } else if (newY > maxY) {
              translateY.value = enableOverDrag
                ? maxY + Math.log(newY - maxY + 1) * 10
                : maxY
            } else {
              translateY.value = newY
            }
          })
          .onEnd((event) => {
            if (isDraggingSheet.value) {
              if (
                dismissOnSwipeDown &&
                translateY.value > windowHeight - minSnapPoint &&
                event.velocityY > 500
              ) {
                closeSheet()
              } else {
                snapToPoint(
                  findClosestSnapPoint(translateY.value, event.velocityY),
                  true
                )
              }
            }
            isDraggingSheet.value = false
          })
          .onFinalize(() => {
            isDraggingSheet.value = false
          }),
      [
        translateY,
        context,
        scrollY,
        gestureStartScrollY,
        isDraggingSheet,
        currentSnapIndex,
        maxSnapIndex,
        enableOverDrag,
        maxSnapPoint,
        minSnapPoint,
        dismissOnSwipeDown,
        closeSheet,
        findClosestSnapPoint,
        snapToPoint,
        windowHeight,
      ]
    )

    const simultaneousGesture = useMemo(
      () => Gesture.Simultaneous(Gesture.Native(), contentPanGesture),
      [contentPanGesture]
    )

    useImperativeHandle(
      ref,
      () => ({
        snapToIndex: (index: number) => presentAtIndex(index),
        snapToPosition: (position: number) => {
          pendingSnapIndex.current = null
          setModalVisible(true)
          translateY.value = withSpring(windowHeight - position, springConfig)
        },
        expand: () => presentAtIndex(maxSnapIndex),
        collapse: () => presentAtIndex(0),
        close: () => {
          if (!modalVisible) {
            handleCloseJS()
            return
          }
          closeSheet()
        },
        getCurrentIndex: () => currentSnapIndex.value,
      }),
      [
        presentAtIndex,
        closeSheet,
        maxSnapIndex,
        springConfig,
        translateY,
        currentSnapIndex,
        modalVisible,
        handleCloseJS,
        windowHeight,
      ]
    )

    const sheetAnimatedStyle = useAnimatedStyle(
      (): Pick<ViewStyle, "transform"> => ({
        transform: [{ translateY: translateY.value }],
      })
    )

    const contentAnimatedStyle = useAnimatedStyle(
      (): Pick<ViewStyle, "height"> => ({
        height: Math.max(0, windowHeight - translateY.value - handleHeight),
      })
    )

    const backdropAnimatedStyle = useAnimatedStyle(
      (): Pick<ViewStyle, "opacity" | "pointerEvents"> => {
        const opacity = interpolate(
          translateY.value,
          [windowHeight - maxSnapPoint, windowHeight],
          [backdropOpacity, 0],
          Extrapolation.CLAMP
        )
        return {
          opacity,
          pointerEvents: opacity > 0 ? "auto" : "none",
        }
      }
    )

    const handleBackdropPress = useCallback(() => {
      if (dismissOnBackdropPress) closeSheet()
    }, [dismissOnBackdropPress, closeSheet])

    const sheetBaseStyle = useMemo(
      () => ({
        height: windowHeight,
        backgroundColor,
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        borderCurve: "continuous" as const,
      }),
      [backgroundColor, borderRadius, windowHeight]
    )

    const scrollProps: Partial<ScrollViewProps> = useMemo(
      () => ({
        scrollEnabled: enableScroll,
        onScroll: onScroll as ScrollViewProps["onScroll"],
        scrollEventThrottle: 16,
        bounces: false,
        overScrollMode: "never" as const,
        showsVerticalScrollIndicator: true,
        nestedScrollEnabled: true,
      }),
      [enableScroll, onScroll]
    )

    const renderContent = useCallback(() => {
      if (!contentScrollEnabled) {
        return <View style={styles.scrollableWrapper}>{children}</View>
      }

      const childArray = Children.toArray(children)
      if (childArray.length === 1 && isScrollableList(childArray[0])) {
        const listElement = childArray[0] as ReactElement
        const enhancedList = cloneElement(listElement, {
          ...scrollProps,
          // Bind the same animated ref used by close/reset + scrollY tracking.
          ref: scrollViewRef,
          onScroll: (event: unknown) => {
            ;(scrollProps.onScroll as ((e: unknown) => void) | undefined)?.(
              event
            )
            ;(
              listElement.props as { onScroll?: (e: unknown) => void }
            ).onScroll?.(event)
          },
          ...(enableDynamicSizing && {
            onContentSizeChange: (width: number, height: number) => {
              handleContentSizeChange(width, height)
              ;(
                listElement.props as {
                  onContentSizeChange?: (w: number, h: number) => void
                }
              ).onContentSizeChange?.(width, height)
            },
          }),
        } as never)
        return (
          <GestureDetector gesture={simultaneousGesture}>
            <Animated.View style={styles.scrollableWrapper}>
              {enhancedList}
            </Animated.View>
          </GestureDetector>
        )
      }

      return (
        <GestureDetector gesture={simultaneousGesture}>
          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={contentContainerStyle}
            scrollEnabled={enableScroll}
            onScroll={onScroll}
            onContentSizeChange={
              enableDynamicSizing ? handleContentSizeChange : undefined
            }
            scrollEventThrottle={16}
            bounces={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            overScrollMode="never"
          >
            {children}
            {/* With a footer, the safe-area padding belongs to the footer. */}
            {footer ? null : <View style={{ height: insets.bottom }} />}
          </Animated.ScrollView>
        </GestureDetector>
      )
    }, [
      children,
      footer,
      contentScrollEnabled,
      scrollProps,
      simultaneousGesture,
      scrollViewRef,
      contentContainerStyle,
      enableScroll,
      onScroll,
      enableDynamicSizing,
      handleContentSizeChange,
      insets.bottom,
    ])

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => closeSheet()}
      >
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.container} pointerEvents="box-none">
            {enableBackdrop ? (
              <Animated.View
                style={[styles.backdrop, backdropAnimatedStyle, backdropStyle]}
              >
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={handleBackdropPress}
                />
              </Animated.View>
            ) : null}
            <Animated.View
              style={[
                styles.sheet,
                sheetBaseStyle,
                sheetAnimatedStyle,
                sheetStyle,
              ]}
            >
              {showHandle ? (
                <GestureDetector gesture={handlePanGesture}>
                  <View style={styles.handleContainer}>
                    <View style={[styles.handle, handleStyle]} />
                  </View>
                </GestureDetector>
              ) : null}
              <Animated.View
                style={[styles.contentWrapper, contentAnimatedStyle]}
              >
                {footer ? (
                  <View style={styles.contentColumn}>
                    {renderContent()}
                    <View
                      onLayout={(event) =>
                        handleFooterLayout(event.nativeEvent.layout.height)
                      }
                      style={{ paddingBottom: insets.bottom }}
                    >
                      {footer}
                    </View>
                  </View>
                ) : (
                  renderContent()
                )}
              </Animated.View>
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    )
  }
)

BottomSheetComponent.displayName = "BottomSheet"

export const BottomSheet = memo(BottomSheetComponent)
export default BottomSheet

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128, 128, 128, 0.45)",
  },
  contentWrapper: {
    overflow: "hidden",
  },
  contentColumn: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollableWrapper: {
    flex: 1,
  },
})
