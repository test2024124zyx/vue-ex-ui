import type { 
  SkeletonItem, 
  SkeletonTemplateConfig,
  SkeletonSize, 
  SkeletonAnimation,
  SkeletonAvatar,
  SkeletonParagraph,
  SkeletonTitle,
  SkeletonRenderOptions
} from './types'

/**
 * 生成随机宽度
 */
export function randomWidth(min: number = 60, max: number = 100): string {
  const width = Math.floor(Math.random() * (max - min + 1)) + min
  return `${width}%`
}

/**
 * 生成骨架屏项目
 */
export function generateItems(count: number, type: SkeletonItem['type'] = 'text'): SkeletonItem[] {
  const items: SkeletonItem[] = []
  
  for (let i = 0; i < count; i++) {
    items.push({
      type,
      width: type === 'text' ? randomWidth() : undefined,
      height: type === 'text' ? '16px' : undefined
    })
  }
  
  return items
}

/**
 * 创建骨架屏模板
 */
export function createTemplate(name: string, items: SkeletonItem[]): SkeletonTemplateConfig {
  return {
    name,
    items,
    width: 300,
    height: 200
  }
}

/**
 * 获取头像配置
 */
export function getAvatarConfig(avatar: boolean | SkeletonAvatar): SkeletonAvatar | null {
  if (!avatar) return null
  
  if (typeof avatar === 'boolean') {
    return {
      size: 'default',
      shape: 'circle',
      active: true
    }
  }
  
  return {
    size: 'default',
    shape: 'circle',
    active: true,
    ...avatar
  }
}

/**
 * 获取段落配置
 */
export function getParagraphConfig(paragraph: boolean | SkeletonParagraph): SkeletonParagraph | null {
  if (!paragraph) return null
  
  if (typeof paragraph === 'boolean') {
    return {
      rows: 3,
      active: true
    }
  }
  
  return {
    rows: 3,
    active: true,
    ...paragraph
  }
}

/**
 * 获取标题配置
 */
export function getTitleConfig(title: boolean | SkeletonTitle): SkeletonTitle | null {
  if (!title) return null
  
  if (typeof title === 'boolean') {
    return {
      width: '50%',
      active: true
    }
  }
  
  return {
    width: '50%',
    active: true,
    ...title
  }
}

/**
 * 获取头像大小
 */
export function getAvatarSize(size: SkeletonAvatar['size']): string {
  if (typeof size === 'number') {
    return `${size}px`
  }
  
  switch (size) {
    case 'small':
      return '32px'
    case 'large':
      return '64px'
    case 'default':
    default:
      return '48px'
  }
}

/**
 * 获取段落行宽度
 */
export function getParagraphRowWidth(width: SkeletonParagraph['width'], index: number): string {
  if (!width) {
    // 默认宽度：最后一行较短
    return index === 0 ? '100%' : randomWidth(60, 90)
  }
  
  if (typeof width === 'number') {
    return `${width}%`
  }
  
  if (typeof width === 'string') {
    return width
  }
  
  if (Array.isArray(width)) {
    const w = width[index] || width[width.length - 1]
    return typeof w === 'number' ? `${w}%` : (w || '100%')
  }
  
  return '100%'
}

/**
 * 生成骨架屏类名
 */
export function getSkeletonClasses(
  animated: boolean,
  animation: SkeletonAnimation,
  size: SkeletonSize,
  round: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-skeleton',
    `ex-skeleton--${size}`
  ]
  
  if (animated && animation !== 'none') {
    classes.push('ex-skeleton--animated', `ex-skeleton--${animation}`)
  }
  
  if (round) {
    classes.push('ex-skeleton--round')
  }
  
  if (className) {
    classes.push(className)
  }
  
  return classes
}

/**
 * 生成骨架屏项目类名
 */
export function getSkeletonItemClasses(
  type: SkeletonItem['type'],
  animated: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-skeleton__item',
    `ex-skeleton__item--${type}`
  ]
  
  if (animated) {
    classes.push('ex-skeleton__item--animated')
  }
  
  if (className) {
    classes.push(className)
  }
  
  return classes
}

/**
 * 生成头像类名
 */
export function getAvatarClasses(
  shape: SkeletonAvatar['shape'],
  size: SkeletonAvatar['size']
): string[] {
  const classes = [
    'ex-skeleton__avatar',
    `ex-skeleton__avatar--${shape}`
  ]
  
  if (typeof size === 'string') {
    classes.push(`ex-skeleton__avatar--${size}`)
  }
  
  return classes
}

/**
 * 获取骨架屏渲染选项
 */
export function getSkeletonRenderOptions(props: Partial<SkeletonRenderOptions>): SkeletonRenderOptions {
  return {
    animated: props.animated ?? true,
    animation: props.animation ?? 'pulse',
    avatar: props.avatar,
    title: props.title,
    paragraph: props.paragraph
  }
}

/**
 * 创建预设模板
 */
export function createPresetTemplates(): Record<string, SkeletonTemplateConfig> {
  return {
    // 文章模板
    article: createTemplate('article', [
      { type: 'text', width: '100%', height: '24px' }, // 标题
      { type: 'text', width: '60%', height: '16px' }, // 副标题
      { type: 'text', width: '100%', height: '16px' }, // 段落1
      { type: 'text', width: '100%', height: '16px' }, // 段落2
      { type: 'text', width: '80%', height: '16px' }   // 段落3
    ]),
    
    // 用户卡片模板
    userCard: createTemplate('userCard', [
      { type: 'avatar', width: '48px', height: '48px' }, // 头像
      { type: 'text', width: '120px', height: '18px' },  // 用户名
      { type: 'text', width: '200px', height: '14px' }   // 描述
    ]),
    
    // 列表项模板
    listItem: createTemplate('listItem', [
      { type: 'rect', width: '40px', height: '40px' }, // 图标
      { type: 'text', width: '150px', height: '16px' }, // 标题
      { type: 'text', width: '100px', height: '14px' }  // 描述
    ]),
    
    // 图片卡片模板
    imageCard: createTemplate('imageCard', [
      { type: 'image', width: '100%', height: '200px' }, // 图片
      { type: 'text', width: '80%', height: '18px' },    // 标题
      { type: 'text', width: '100%', height: '14px' },   // 描述1
      { type: 'text', width: '60%', height: '14px' }     // 描述2
    ]),
    
    // 表格行模板
    tableRow: createTemplate('tableRow', [
      { type: 'text', width: '100px', height: '16px' }, // 列1
      { type: 'text', width: '150px', height: '16px' }, // 列2
      { type: 'text', width: '80px', height: '16px' },  // 列3
      { type: 'text', width: '120px', height: '16px' }  // 列4
    ])
  }
}

/**
 * 计算动画延迟
 */
export function calculateAnimationDelay(index: number, stagger: number = 100): string {
  return `${index * stagger}ms`
}

/**
 * 生成波浪动画关键帧
 */
export function generateWaveKeyframes(): string {
  return `
    @keyframes ex-skeleton-wave {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `
}

/**
 * 生成脉冲动画关键帧
 */
export function generatePulseKeyframes(): string {
  return `
    @keyframes ex-skeleton-pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        opacity: 1;
      }
    }
  `
}

/**
 * 检查是否支持动画
 */
export function supportsAnimation(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检查用户是否禁用了动画
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  return !prefersReducedMotion.matches
}

/**
 * 获取动画持续时间
 */
export function getAnimationDuration(animation: SkeletonAnimation): string {
  switch (animation) {
    case 'pulse':
      return '1.5s'
    case 'wave':
      return '2s'
    case 'none':
    default:
      return '0s'
  }
}

/**
 * 获取动画时间函数
 */
export function getAnimationTimingFunction(animation: SkeletonAnimation): string {
  switch (animation) {
    case 'pulse':
      return 'ease-in-out'
    case 'wave':
      return 'linear'
    case 'none':
    default:
      return 'linear'
  }
}

/**
 * 深度克隆骨架屏配置
 */
export function cloneSkeletonConfig<T>(config: T): T {
  if (config === null || typeof config !== 'object') {
    return config
  }
  
  if (config instanceof Date) {
    return new Date(config.getTime()) as T
  }
  
  if (config instanceof Array) {
    return config.map(item => cloneSkeletonConfig(item)) as T
  }
  
  if (typeof config === 'object') {
    const cloned = {} as T
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        cloned[key] = cloneSkeletonConfig(config[key])
      }
    }
    return cloned
  }
  
  return config
}

/**
 * 合并骨架屏配置
 */
export function mergeSkeletonConfig<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = cloneSkeletonConfig(target)
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      if (sourceValue !== undefined) {
        result[key] = sourceValue
      }
    }
  }
  
  return result
}