import type { App } from 'vue'
import ExBackTop from './ExBackTop.vue'

// 导出组件类型
export type {
  ExBackTopProps,
  ExBackTopEmits,
  ExBackTopInstance,
  BackTopPosition,
  BackTopShape,
  BackTopSize,
  BackTopAnimation,
  BackTopScrollBehavior,
  BackTopProgressType,
  BackTopTheme,
  BackTopAnimationConfig,
  BackTopTrigger,
  BackTopScrollInfo,
  BackTopDragBounds,
  BackTopDragState,
  BackTopPerformanceMonitor,
  BackTopPerformanceReport
} from './types'

// 导出工具函数
export {
  defaultBackTopConfig,
  getTarget,
  getScrollInfo,
  shouldShow,
  scrollToPosition,
  getPositionStyles,
  getDefaultOffset,
  getSizeStyles,
  getShapeStyles,
  getThemeStyles,
  getHoverThemeStyles,
  throttle,
  debounce,
  isMobile,
  savePosition,
  loadPosition,
  calculateDragBounds,
  createPerformanceMonitor,
  recordScrollEvent,
  recordClickEvent,
  recordScrollAnimation,
  createTrigger,
  getDefaultIcon,
  validateConfig,
  clamp
} from './utils'

// 组件安装函数
ExBackTop.install = (app: App): void => {
  app.component('ExBackTop', ExBackTop)
}

// 导出组件
export { ExBackTop }
export default ExBackTop