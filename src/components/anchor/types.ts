/**
 * 锚点项
 */
export interface AnchorItem {
  /** 锚点链接 */
  href: string;
  /** 锚点标题 */
  title: string;
  /** DOM元素 */
  element: HTMLElement;
}

/**
 * Anchor 组件属性
 */
export interface ExAnchorProps {
  /** 距离窗口顶部达到指定偏移量后触发 */
  offsetTop?: number;
  /** 锚点区域边界 */
  bounds?: number;
  /** 设置锚点滚动偏移量 */
  targetOffset?: number;
  /** 指定滚动的容器 */
  container?: () => HTMLElement | Window;
  /** 固定模式 */
  affix?: boolean;
}

/**
 * Anchor 组件事件
 */
export interface ExAnchorEmits {
  /** 点击锚点时触发 */
  click: [href: string, item: AnchorItem];
  /** 锚点改变时触发 */
  change: [href: string];
}

/**
 * Anchor 组件暴露的方法
 */
export interface ExAnchorExposed {
  /** 滚动到指定锚点 */
  scrollToAnchor: (href: string) => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}

/**
 * AnchorLink 组件属性
 */
export interface ExAnchorLinkProps {
  /** 锚点链接 */
  href: string;
  /** 锚点标题 */
  title: string;
}

/**
 * AnchorLink 组件事件
 */
export interface ExAnchorLinkEmits {
  /** 点击锚点时触发 */
  click: [href: string];
}
