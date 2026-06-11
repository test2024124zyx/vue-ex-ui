import { debounce, throttle } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { debounce, throttle }

import type { 
  PopoverPlacement, 
  PopoverPosition, 
  PopoverBoundaryCheck,
  PopoverTrigger,
  PopoverConfig
} from './types'

/**
 * 默认配置
 */
export const defaultPopoverConfig: PopoverConfig = {
  placement: 'top',
  trigger: 'hover',
  mouseEnterDelay: 100,
  mouseLeaveDelay: 100,
  offset: [0, 8],
  zIndex: 1000,
  arrow: true,
  autoAdjustOverflow: true
}

/**
 * 计算弹出层位置
 */
export function calculatePopoverPosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  placement: PopoverPlacement,
  offset: [number, number] = [0, 8]
): PopoverPosition {
  const [offsetX, offsetY] = offset
  let x = 0
  let y = 0
  let arrowX: number | undefined
  let arrowY: number | undefined

  switch (placement) {
    case 'top':
      x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 + offsetX
      y = triggerRect.top - popoverRect.height - offsetY
      arrowX = popoverRect.width / 2
      arrowY = popoverRect.height
      break
    
    case 'topLeft':
      x = triggerRect.left + offsetX
      y = triggerRect.top - popoverRect.height - offsetY
      arrowX = triggerRect.width / 2
      arrowY = popoverRect.height
      break
    
    case 'topRight':
      x = triggerRect.right - popoverRect.width - offsetX
      y = triggerRect.top - popoverRect.height - offsetY
      arrowX = popoverRect.width - triggerRect.width / 2
      arrowY = popoverRect.height
      break
    
    case 'bottom':
      x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 + offsetX
      y = triggerRect.bottom + offsetY
      arrowX = popoverRect.width / 2
      arrowY = 0
      break
    
    case 'bottomLeft':
      x = triggerRect.left + offsetX
      y = triggerRect.bottom + offsetY
      arrowX = triggerRect.width / 2
      arrowY = 0
      break
    
    case 'bottomRight':
      x = triggerRect.right - popoverRect.width - offsetX
      y = triggerRect.bottom + offsetY
      arrowX = popoverRect.width - triggerRect.width / 2
      arrowY = 0
      break
    
    case 'left':
      x = triggerRect.left - popoverRect.width - offsetY
      y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 + offsetX
      arrowX = popoverRect.width
      arrowY = popoverRect.height / 2
      break
    
    case 'leftTop':
      x = triggerRect.left - popoverRect.width - offsetY
      y = triggerRect.top + offsetX
      arrowX = popoverRect.width
      arrowY = triggerRect.height / 2
      break
    
    case 'leftBottom':
      x = triggerRect.left - popoverRect.width - offsetY
      y = triggerRect.bottom - popoverRect.height - offsetX
      arrowX = popoverRect.width
      arrowY = popoverRect.height - triggerRect.height / 2
      break
    
    case 'right':
      x = triggerRect.right + offsetY
      y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 + offsetX
      arrowX = 0
      arrowY = popoverRect.height / 2
      break
    
    case 'rightTop':
      x = triggerRect.right + offsetY
      y = triggerRect.top + offsetX
      arrowX = 0
      arrowY = triggerRect.height / 2
      break
    
    case 'rightBottom':
      x = triggerRect.right + offsetY
      y = triggerRect.bottom - popoverRect.height - offsetX
      arrowX = 0
      arrowY = popoverRect.height - triggerRect.height / 2
      break
  }

  return {
    top: Math.round(y),
    left: Math.round(x),
    right: Math.round(x) + popoverRect.width,
    bottom: Math.round(y) + popoverRect.height,
    x: Math.round(x),
    y: Math.round(y),
    placement,
    arrowX: arrowX ? Math.round(arrowX) : undefined,
    arrowY: arrowY ? Math.round(arrowY) : undefined
  }
}

/**
 * 检查边界溢出
 */
export function checkPopoverBoundary(
  popoverRect: DOMRect,
  containerRect: DOMRect = {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    x: 0,
    y: 0,
    toJSON: () => ({})
  }
): PopoverBoundaryCheck {
  return {
    top: popoverRect.top < containerRect.top,
    right: popoverRect.right > containerRect.right,
    bottom: popoverRect.bottom > containerRect.bottom,
    left: popoverRect.left < containerRect.left
  }
}

/**
 * 获取最佳弹出位置
 */
export function getBestPopoverPlacement(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  preferredPlacement: PopoverPlacement,
  containerRect?: DOMRect
): PopoverPlacement {
  const placements: PopoverPlacement[] = [
    preferredPlacement,
    getOppositePlacement(preferredPlacement),
    ...getAlternativePlacements(preferredPlacement)
  ]

  for (const placement of placements) {
    const position = calculatePopoverPosition(triggerRect, popoverRect, placement)
    const testRect: DOMRect = {
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
      width: popoverRect.width,
      height: popoverRect.height,
      x: position.x,
      y: position.y,
      toJSON: () => ({})
    }
    
    const boundary = checkPopoverBoundary(testRect, containerRect)
    
    if (!boundary.top && !boundary.right && !boundary.bottom && !boundary.left) {
      return placement
    }
  }

  return preferredPlacement
}

/**
 * 获取相对位置
 */
export function getOppositePlacement(placement: PopoverPlacement): PopoverPlacement {
  const oppositeMap: Record<PopoverPlacement, PopoverPlacement> = {
    top: 'bottom',
    'top-start': 'bottom-start',
    'top-end': 'bottom-end',
    topLeft: 'bottomLeft',
    topRight: 'bottomRight',
    bottom: 'top',
    'bottom-start': 'top-start',
    'bottom-end': 'top-end',
    bottomLeft: 'topLeft',
    bottomRight: 'topRight',
    left: 'right',
    'left-start': 'right-start',
    'left-end': 'right-end',
    leftTop: 'rightTop',
    leftBottom: 'rightBottom',
    right: 'left',
    'right-start': 'left-start',
    'right-end': 'left-end',
    rightTop: 'leftTop',
    rightBottom: 'leftBottom'
  }
  
  return oppositeMap[placement] || placement
}

/**
 * 获取备选位置
 */
export function getAlternativePlacements(placement: PopoverPlacement): PopoverPlacement[] {
  const alternativeMap: Record<PopoverPlacement, PopoverPlacement[]> = {
    top: ['left', 'right', 'topLeft', 'topRight'],
    'top-start': ['left-start', 'right-start', 'topLeft', 'topRight'],
    'top-end': ['left-end', 'right-end', 'topLeft', 'topRight'],
    topLeft: ['top', 'left', 'topRight', 'leftTop'],
    topRight: ['top', 'right', 'topLeft', 'rightTop'],
    bottom: ['left', 'right', 'bottomLeft', 'bottomRight'],
    'bottom-start': ['left-start', 'right-start', 'bottomLeft', 'bottomRight'],
    'bottom-end': ['left-end', 'right-end', 'bottomLeft', 'bottomRight'],
    bottomLeft: ['bottom', 'left', 'bottomRight', 'leftBottom'],
    bottomRight: ['bottom', 'right', 'bottomLeft', 'rightBottom'],
    left: ['top', 'bottom', 'leftTop', 'leftBottom'],
    'left-start': ['top-start', 'bottom-start', 'leftTop', 'leftBottom'],
    'left-end': ['top-end', 'bottom-end', 'leftTop', 'leftBottom'],
    leftTop: ['left', 'top', 'leftBottom', 'topLeft'],
    leftBottom: ['left', 'bottom', 'leftTop', 'bottomLeft'],
    right: ['top', 'bottom', 'rightTop', 'rightBottom'],
    'right-start': ['top-start', 'bottom-start', 'rightTop', 'rightBottom'],
    'right-end': ['top-end', 'bottom-end', 'rightTop', 'rightBottom'],
    rightTop: ['right', 'top', 'rightBottom', 'topRight'],
    rightBottom: ['right', 'bottom', 'rightTop', 'bottomRight']
  }
  
  return alternativeMap[placement] || []
}

/**
 * 生成弹出层类名
 */
export function getPopoverClasses(
  placement: PopoverPlacement,
  arrow: boolean,
  visible: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-popover',
    `ex-popover--${placement}`
  ]
  
  if (arrow) {
    classes.push('ex-popover--arrow')
  }
  
  if (visible) {
    classes.push('ex-popover--visible')
  }
  
  if (className) {
    classes.push(className)
  }
  
  return classes
}

/**
 * 生成箭头类名
 */
export function getArrowClasses(placement: PopoverPlacement): string[] {
  const classes = ['ex-popover__arrow']
  
  if (placement.startsWith('top')) {
    classes.push('ex-popover__arrow--bottom')
  } else if (placement.startsWith('bottom')) {
    classes.push('ex-popover__arrow--top')
  } else if (placement.startsWith('left')) {
    classes.push('ex-popover__arrow--right')
  } else if (placement.startsWith('right')) {
    classes.push('ex-popover__arrow--left')
  }
  
  return classes
}

/**
 * 获取触发器事件
 */
export function getTriggerEvents(triggers: PopoverTrigger[]): Record<string, ((...args: unknown[]) => void)[]> {
  const events: Record<string, ((...args: unknown[]) => void)[]> = {}
  
  triggers.forEach(trigger => {
    switch (trigger) {
      case 'hover':
        if (!events.mouseenter) events.mouseenter = []
        if (!events.mouseleave) events.mouseleave = []
        break
      case 'click':
        if (!events.click) events.click = []
        break
      case 'focus':
        if (!events.focus) events.focus = []
        if (!events.blur) events.blur = []
        break
      case 'contextmenu':
        if (!events.contextmenu) events.contextmenu = []
        break
    }
  })
  
  return events
}

// debounce 和 throttle 已从 '../../utils' 导入

/**
 * 获取滚动父元素
 */
export function getScrollParent(element: HTMLElement): HTMLElement {
  if (!element || element === document.body) {
    return document.body
  }
  
  const style = getComputedStyle(element)
  const overflowRegex = /(auto|scroll)/
  
  if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
    return element
  }
  
  return getScrollParent(element.parentElement!)
}

/**
 * 获取定位父元素
 */
export function getOffsetParent(element: HTMLElement): HTMLElement {
  let offsetParent = element.offsetParent as HTMLElement
  
  while (offsetParent && getComputedStyle(offsetParent).position === 'static') {
    offsetParent = offsetParent.offsetParent as HTMLElement
  }
  
  return offsetParent || document.body
}

/**
 * 获取元素相对于页面的位置
 */
export function getElementRect(element: HTMLElement): DOMRect {
  const rect = element.getBoundingClientRect()
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    right: rect.right + scrollLeft,
    bottom: rect.bottom + scrollTop,
    width: rect.width,
    height: rect.height,
    x: rect.x + scrollLeft,
    y: rect.y + scrollTop,
    toJSON: () => ({})
  }
}

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 获取弹出层容器
 */
export function getPopoverContainer(getContainer?: () => HTMLElement): HTMLElement {
  if (getContainer) {
    try {
      return getContainer()
    } catch (error) {
      console.warn('Failed to get popover container:', error)
    }
  }
  
  return document.body
}

/**
 * 创建弹出层元素
 */
export function createPopoverElement(): HTMLElement {
  const element = document.createElement('div')
  element.className = 'ex-popover-container'
  element.style.position = 'absolute'
  element.style.top = '0'
  element.style.left = '0'
  element.style.zIndex = '1000'
  
  return element
}

/**
 * 销毁弹出层元素
 */
export function destroyPopoverElement(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element)
  }
}

/**
 * 获取动画名称
 */
export function getPopoverTransitionName(placement: PopoverPlacement): string {
  if (placement.startsWith('top')) {
    return 'ex-popover-zoom-big-arrow-top'
  } else if (placement.startsWith('bottom')) {
    return 'ex-popover-zoom-big-arrow-bottom'
  } else if (placement.startsWith('left')) {
    return 'ex-popover-zoom-big-arrow-left'
  } else if (placement.startsWith('right')) {
    return 'ex-popover-zoom-big-arrow-right'
  }
  
  return 'ex-popover-zoom-big'
}

/**
 * 合并触发器配置
 */
export function mergeTriggerConfig(
  triggers: PopoverTrigger | PopoverTrigger[],
  mouseEnterDelay: number,
  mouseLeaveDelay: number,
  disabled: boolean
) {
  const triggerArray = Array.isArray(triggers) ? triggers : [triggers]
  
  return {
    trigger: triggerArray,
    mouseEnterDelay,
    mouseLeaveDelay,
    disabled
  }
}