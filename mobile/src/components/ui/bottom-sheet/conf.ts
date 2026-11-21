import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated"

export const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
}

export const DEFAULT_TIMING_CONFIG: WithTimingConfig = {
  duration: 280,
}

export const HANDLE_HEIGHT = 28
export const SCROLL_TOP_THRESHOLD = 1
