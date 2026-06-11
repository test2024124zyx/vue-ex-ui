import type { VNode, Component, CSSProperties } from 'vue'

/**
 * BackTop 位置类型
 */
export type BackTopPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center'

/**
 * BackTop 形状类型
 */
export type BackTopShape = 'circle' | 'square' | 'rounded'

/**
 * BackTop 大小类型
 */
export type BackTopSize = 'small' | 'medium' | 'large'

/**
 * BackTop 动画类型
 */
export type BackTopAnimation = 'fade' | 'slide' | 'zoom' | 'bounce' | 'none'

/**
 * BackTop 滚动行为
 */
export type BackTopScrollBehavior = 'auto' | 'smooth' | 'instant'

/**
 * BackTop 目标类型
 */
export type BackTopTarget = HTMLElement | Window | string | (() => HTMLElement | Window)

/**
 * BackTop 触发条件
 */
export interface BackTopTrigger {
  /** 滚动距离阈值 */
  scrollTop?: number
  /** 滚动百分比阈值 */
  scrollPercent?: number
  /** 自定义触发条件 */
  custom?: (scrollInfo: BackTopScrollInfo) => boolean
}

/**
 * BackTop 滚动信息
 */
export interface BackTopScrollInfo {
  /** 当前滚动位置 */
  scrollTop: number
  /** 滚动百分比 */
  scrollPercent: number
  /** 滚动高度 */
  scrollHeight: number
  /** 客户端高度 */
  clientHeight: number
  /** 是否向下滚动 */
  scrollingDown: boolean
  /** 滚动速度 */
  scrollSpeed: number
}

/**
 * BackTop 偏移配置
 */
export interface BackTopOffset {
  /** 右侧偏移 */
  right?: number | string
  /** 左侧偏移 */
  left?: number | string
  /** 顶部偏移 */
  top?: number | string
  /** 底部偏移 */
  bottom?: number | string
}

/**
 * BackTop 动画配置
 */
export interface BackTopAnimationConfig {
  /** 进入动画持续时间 */
  enterDuration: number
  /** 离开动画持续时间 */
  leaveDuration: number
  /** 动画缓动函数 */
  easing: string
  /** 是否启用动画 */
  enabled: boolean
  /** 滚动动画持续时间 */
  scrollDuration: number
  /** 滚动动画缓动函数 */
  scrollEasing: string
}

/**
 * BackTop 主题配置
 */
export interface BackTopThemeConfig {
  /** 背景颜色 */
  backgroundColor: string
  /** 文字颜色 */
  textColor: string
  /** 边框颜色 */
  borderColor: string
  /** 悬停背景颜色 */
  hoverBackgroundColor: string
  /** 悬停文字颜色 */
  hoverTextColor: string
  /** 悬停边框颜色 */
  hoverBorderColor: string
  /** 阴影 */
  boxShadow: string
  /** 悬停阴影 */
  hoverBoxShadow: string
}

/**
 * BackTop 组件属性
 */
export interface ExBackTopProps {
  /** 显示位置 */
  position?: BackTopPosition
  /** 形状 */
  shape?: BackTopShape
  /** 大小 */
  size?: BackTopSize
  /** 触发显示的滚动距离 */
  visibilityHeight?: number
  /** 触发显示的滚动百分比 */
  visibilityPercent?: number
  /** 自定义触发条件 */
  trigger?: BackTopTrigger
  /** 目标容器 */
  target?: BackTopTarget
  /** 滚动行为 */
  scrollBehavior?: BackTopScrollBehavior
  /** 滚动持续时间 */
  scrollDuration?: number
  /** 滚动到的位置 */
  scrollTo?: number
  /** 位置偏移 */
  offset?: BackTopOffset
  /** 动画类型 */
  animation?: BackTopAnimation
  /** 动画配置 */
  animationConfig?: Partial<BackTopAnimationConfig>
  /** 是否显示文字 */
  showText?: boolean
  /** 文字内容 */
  text?: string
  /** 自定义图标 */
  icon?: VNode | Component | string
  /** 是否显示进度 */
  showProgress?: boolean
  /** 进度类型 */
  progressType?: 'circle' | 'line'
  /** 是否显示百分比 */
  showPercent?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
  /** z-index */
  zIndex?: number
  /** 是否启用 */
  enabled?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 拖拽边界 */
  dragBounds?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  /** 是否记住拖拽位置 */
  rememberPosition?: boolean
  /** 存储键名 */
  storageKey?: string
  /** 节流延迟 */
  throttleDelay?: number
  /** 是否在移动端显示 */
  showOnMobile?: boolean
  /** 移动端断点 */
  mobileBreakpoint?: number
  /** 主题配置 */
  theme?: Partial<BackTopThemeConfig>
  /** 点击回调 */
  onClick?: (event: MouseEvent) => void
  /** 滚动开始回调 */
  onScrollStart?: () => void
  /** 滚动结束回调 */
  onScrollEnd?: () => void
  /** 显示状态改变回调 */
  onVisibilityChange?: (visible: boolean) => void
  /** 拖拽开始回调 */
  onDragStart?: (event: MouseEvent | TouchEvent) => void
  /** 拖拽结束回调 */
  onDragEnd?: (event: MouseEvent | TouchEvent, position: { x: number; y: number }) => void
}

/**
 * BackTop 组件事件
 */
export interface ExBackTopEmits {
  /** 点击事件 */
  'click': [event: MouseEvent]
  /** 滚动开始 */
  'scroll-start': []
  /** 滚动结束 */
  'scroll-end': []
  /** 显示状态改变 */
  'visibility-change': [visible: boolean]
  /** 拖拽开始 */
  'drag-start': [event: MouseEvent | TouchEvent]
  /** 拖拽中 */
  'drag-move': [event: MouseEvent | TouchEvent, position: { x: number; y: number }]
  /** 拖拽结束 */
  'drag-end': [event: MouseEvent | TouchEvent, position: { x: number; y: number }]
}

/**
 * BackTop 组件实例
 */
export interface ExBackTopInstance {
  /** DOM 元素 */
  $el: HTMLElement
  /** 是否可见 */
  visible: boolean
  /** 当前滚动信息 */
  scrollInfo: BackTopScrollInfo
  /** 滚动到顶部 */
  scrollToTop: () => Promise<void>
  /** 滚动到指定位置 */
  scrollToPosition: (position: number) => Promise<void>
  /** 显示 */
  show: () => void
  /** 隐藏 */
  hide: () => void
  /** 切换显示状态 */
  toggle: () => void
  /** 更新滚动信息 */
  updateScrollInfo: () => void
  /** 检查可见性 */
  checkVisibility: () => void
  /** 获取目标元素 */
  getTarget: () => HTMLElement | Window
  /** 重置位置 */
  resetPosition: () => void
  /** 保存位置 */
  savePosition: () => void
  /** 加载位置 */
  loadPosition: () => void
}

/**
 * BackTop 服务配置
 */
export interface BackTopServiceConfig {
  /** 全局位置 */
  position: BackTopPosition
  /** 全局形状 */
  shape: BackTopShape
  /** 全局大小 */
  size: BackTopSize
  /** 全局触发高度 */
  visibilityHeight: number
  /** 全局动画类型 */
  animation: BackTopAnimation
  /** 全局 z-index */
  zIndex: number
  /** 全局主题 */
  theme: BackTopThemeConfig
  /** 全局动画配置 */
  animationConfig: BackTopAnimationConfig
}

/**
 * BackTop 服务实例
 */
export interface BackTopServiceInstance {
  /** 实例 ID */
  id: string
  /** 组件实例 */
  instance: ExBackTopInstance
  /** 配置 */
  config: BackTopServiceConfig
  /** 创建时间 */
  createdAt: number
  /** 最后更新时间 */
  updatedAt: number
}

/**
 * BackTop 管理器
 */
export interface BackTopManager {
  /** 创建实例 */
  create: (config?: Partial<BackTopServiceConfig>) => BackTopServiceInstance
  /** 销毁实例 */
  destroy: (id: string) => void
  /** 获取实例 */
  getInstance: (id: string) => BackTopServiceInstance | undefined
  /** 获取所有实例 */
  getAllInstances: () => BackTopServiceInstance[]
  /** 显示所有实例 */
  showAll: () => void
  /** 隐藏所有实例 */
  hideAll: () => void
  /** 滚动所有实例到顶部 */
  scrollAllToTop: () => Promise<void>
  /** 更新所有实例 */
  updateAll: () => void
  /** 清理所有实例 */
  clear: () => void
}

/**
 * BackTop 全局配置
 */
export interface BackTopGlobalConfig {
  /** 默认位置 */
  defaultPosition: BackTopPosition
  /** 默认形状 */
  defaultShape: BackTopShape
  /** 默认大小 */
  defaultSize: BackTopSize
  /** 默认触发高度 */
  defaultVisibilityHeight: number
  /** 默认滚动行为 */
  defaultScrollBehavior: BackTopScrollBehavior
  /** 默认滚动持续时间 */
  defaultScrollDuration: number
  /** 默认动画类型 */
  defaultAnimation: BackTopAnimation
  /** 默认 z-index */
  defaultZIndex: number
  /** 默认节流延迟 */
  defaultThrottleDelay: number
  /** 默认是否启用 */
  defaultEnabled: boolean
  /** 默认是否在移动端显示 */
  defaultShowOnMobile: boolean
  /** 默认移动端断点 */
  defaultMobileBreakpoint: number
  /** 默认主题 */
  defaultTheme: BackTopThemeConfig
  /** 默认动画配置 */
  defaultAnimationConfig: BackTopAnimationConfig
  /** CSS 变量 */
  cssVariables: Record<string, string>
}

/**
 * BackTop 性能监控
 */
export interface BackTopPerformanceMonitor {
  /** 滚动事件计数 */
  scrollEventCount: number
  /** 点击事件计数 */
  clickEventCount: number
  /** 滚动动画计数 */
  scrollAnimationCount: number
  /** 平均滚动时间 */
  averageScrollTime: number
  /** 最大滚动时间 */
  maxScrollTime: number
  /** 最小滚动时间 */
  minScrollTime: number
  /** 开始监控 */
  start: () => void
  /** 停止监控 */
  stop: () => void
  /** 重置统计 */
  reset: () => void
  /** 获取报告 */
  getReport: () => BackTopPerformanceReport
}

/**
 * BackTop 性能报告
 */
export interface BackTopPerformanceReport {
  /** 监控时长 */
  duration: number
  /** 事件统计 */
  events: {
    scroll: number
    click: number
    scrollAnimation: number
  }
  /** 性能统计 */
  performance: {
    averageScrollTime: number
    maxScrollTime: number
    minScrollTime: number
    totalScrollTime: number
  }
  /** 内存使用 */
  memory?: {
    used: number
    total: number
  }
}

/**
 * BackTop 拖拽状态
 */
export interface BackTopDragState {
  /** 是否正在拖拽 */
  dragging: boolean
  /** 拖拽开始位置 */
  startPosition: { x: number; y: number }
  /** 当前位置 */
  currentPosition: { x: number; y: number }
  /** 偏移量 */
  offset: { x: number; y: number }
  /** 边界 */
  bounds: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/**
 * BackTop 工具函数类型
 */
export interface BackTopUtils {
  /** 获取目标元素 */
  getTarget: (target: BackTopTarget) => HTMLElement | Window
  /** 获取滚动信息 */
  getScrollInfo: (target: HTMLElement | Window) => BackTopScrollInfo
  /** 检查是否应该显示 */
  shouldShow: (scrollInfo: BackTopScrollInfo, trigger: BackTopTrigger) => boolean
  /** 滚动到位置 */
  scrollToPosition: (target: HTMLElement | Window, position: number, options: {
    behavior: BackTopScrollBehavior
    duration: number
  }) => Promise<void>
  /** 获取位置样式 */
  getPositionStyles: (position: BackTopPosition, offset: BackTopOffset) => CSSProperties
  /** 节流函数 */
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, delay: number) => T
  /** 防抖函数 */
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, delay: number) => T
  /** 检查是否为移动设备 */
  isMobile: (breakpoint?: number) => boolean
  /** 保存位置到存储 */
  savePosition: (key: string, position: { x: number; y: number }) => void
  /** 从存储加载位置 */
  loadPosition: (key: string) => { x: number; y: number } | null
  /** 获取默认偏移 */
  getDefaultOffset: (position: BackTopPosition) => BackTopOffset
  /** 计算拖拽边界 */
  calculateDragBounds: (element: HTMLElement, bounds?: Partial<BackTopDragState['bounds']>) => BackTopDragState['bounds']
}
/**

 * BackTop 进度类型
 */
export type BackTopProgressType = 'circle' | 'line';

/**
 * BackTop 主题类型
 */
export type BackTopTheme = 'light' | 'dark' | 'primary' | 'custom';

/**
 * BackTop 拖拽边界
 */
export interface BackTopDragBounds {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
