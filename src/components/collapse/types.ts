import type { CSSProperties } from 'vue';

/** 折叠项的稳定标识类型。 */
export type CollapseItemName = string | number;

/**
 * 激活值：普通模式使用数组，手风琴模式使用单值，null 表示手风琴模式下全部关闭。
 */
export type CollapseActiveName = CollapseItemName | CollapseItemName[] | null;

/** 折叠面板属性。 */
export interface ExCollapseProps {
  /** 当前激活项；显式值（含 null、空数组）等待父级回写，undefined 使用内部状态。 */
  modelValue?: CollapseActiveName;
  /** 是否限制为同时展开一个面板。 */
  accordion?: boolean;
  /** 是否显示容器边框。 */
  bordered?: boolean;
  /** 是否禁用全部折叠项。 */
  disabled?: boolean;
  /** 展开图标的位置。 */
  expandIconPosition?: 'left' | 'right';
  /** 根元素自定义类名。 */
  class?: string | string[] | Record<string, boolean>;
  /** 根元素自定义样式。 */
  style?: string | CSSProperties;
  /** 折叠面板分组的无障碍名称。 */
  ariaLabel?: string;
}

/** 折叠面板事件。 */
export interface ExCollapseEmits {
  /** 激活项发生变化。 */
  'update:modelValue': [value: CollapseActiveName];
  /** 一次面板切换完成。 */
  change: [activeNames: CollapseActiveName];
}

/** 折叠面板公开方法。 */
export interface ExCollapseExposed {
  /** 获取根元素。 */
  getElement: () => HTMLDivElement | null;
  /** 规范化并设置激活项，同时发出对应事件。 */
  setActiveNames: (names: CollapseActiveName) => void;
}

/** 折叠项属性。 */
export interface ExCollapseItemProps {
  /** 同一折叠面板内唯一的标识。 */
  name: CollapseItemName;
  /** 面板标题。 */
  title?: string;
  /** 是否禁用当前项。 */
  disabled?: boolean;
  /** 是否显示展开图标。 */
  showArrow?: boolean;
  /** 根元素自定义类名。 */
  class?: string | string[] | Record<string, boolean>;
  /** 根元素自定义样式。 */
  style?: string | CSSProperties;
  /** 切换按钮的无障碍名称。 */
  ariaLabel?: string;
}

/** 折叠项公开方法。 */
export interface ExCollapseItemExposed {
  /** 获取折叠项根元素。 */
  getElement: () => HTMLDivElement | null;
  /** 在未禁用时切换展开状态。 */
  toggle: () => void;
}
