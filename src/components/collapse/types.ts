/**
 * 折叠面板项的名称类型
 */
export type CollapseItemName = string | number;

/**
 * 折叠面板激活项类型
 */
export type CollapseActiveName = CollapseItemName | CollapseItemName[];

/**
 * 折叠面板组件属性
 */
export interface ExCollapseProps {
  /** 当前激活的面板（手风琴模式下为单个值，否则为数组） */
  modelValue?: CollapseActiveName;
  /** 是否开启手风琴模式（一次只能展开一个面板） */
  accordion?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否禁用所有面板 */
  disabled?: boolean;
  /** 展开图标位置 */
  expandIconPosition?: 'left' | 'right';
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 折叠面板组件事件
 */
export interface ExCollapseEmits {
  /** 值改变事件 */
  'update:modelValue': [value: CollapseActiveName];
  /** 面板切换事件 */
  change: [activeNames: CollapseActiveName];
}

/**
 * 折叠面板组件暴露的方法
 */
export interface ExCollapseExposed {
  /** 获取折叠面板DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 设置激活的面板 */
  setActiveNames: (names: CollapseActiveName) => void;
}

/**
 * 折叠面板项组件属性
 */
export interface ExCollapseItemProps {
  /** 唯一标识符 */
  name: CollapseItemName;
  /** 面板标题 */
  title?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示箭头 */
  showArrow?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 折叠面板项组件暴露的方法
 */
export interface ExCollapseItemExposed {
  /** 获取面板项DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 切换面板展开/收起状态 */
  toggle: () => void;
}
