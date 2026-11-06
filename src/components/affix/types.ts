/** Affix 组件公开属性。 */
export interface ExAffixProps {
  /** 距离滚动容器顶部达到该偏移量后固定。 */
  offsetTop?: number;
  /** 距离滚动容器底部达到该偏移量后固定。 */
  offsetBottom?: number;
  /** 返回需要监听的滚动容器。 */
  target?: () => HTMLElement | Window;
  /** 固定内容的层叠顺序。 */
  zIndex?: number;
}

export interface ExAffixEmits {
  /** 固定状态发生变化时触发。 */
  change: [fixed: boolean];
}

export interface ExAffixExposed {
  /** 立即重新计算固定状态与位置。 */
  updatePosition(): void;
  /** 获取占位根元素。 */
  getElement(): HTMLDivElement | null;
}
