export interface ExEllipsisProps {
  /**
   * 省略的行数（支持多行省略）
   */
  lines?: number;
  /**
   * 是否允许展开/收起
   */
  expandable?: boolean;
  /**
   * 是否在 hover 时显示完整文本的 title（浏览器原生 tooltip）
   */
  tooltip?: boolean;
  /**
   * a11y 标签（无文本或需覆盖时使用）
   */
  ariaLabel?: string;
}

export const ellipsisPropDefs = {
  lines: { type: Number, default: 1 },
  expandable: { type: Boolean, default: false },
  tooltip: { type: Boolean, default: true },
  ariaLabel: { type: String, default: '' },
};
