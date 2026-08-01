export type EllipsisExpandControl = 'button' | 'inline';

/** 文本省略属性。 */
export interface ExEllipsisProps {
  /** 折叠状态最多显示的正整数行数。 */
  lines?: number;
  /** 是否允许展开和收起。 */
  expandable?: boolean;
  /** 展开控件样式：底部文字按钮或最后一行行内动态图标。 */
  expandControl?: EllipsisExpandControl;
  /** 真实溢出时是否用原生 title 展示完整文本。 */
  tooltip?: boolean;
  /** 根分组的无障碍名称。 */
  ariaLabel?: string;
  /** 受控展开状态。 */
  expanded?: boolean;
  /** 非受控初始展开状态。 */
  defaultExpanded?: boolean;
}

/** 文本省略事件。 */
export interface ExEllipsisEmits {
  'update:expanded': [expanded: boolean];
  expand: [];
  collapse: [];
}

/** 文本省略公开方法。 */
export interface ExEllipsisExposed {
  /** 获取根元素。 */
  getElement: () => HTMLElement | null;
  /** 立即重新测量溢出状态。 */
  checkOverflow: () => void;
  /** 请求展开。 */
  expand: () => void;
  /** 请求收起。 */
  collapse: () => void;
  /** 请求切换展开状态。 */
  toggle: () => void;
  /** 获取真实展开状态。 */
  isExpanded: () => boolean;
}
