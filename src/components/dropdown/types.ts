/**
 * 下拉菜单触发方式
 */
export type DropdownTrigger = 'hover' | 'click' | 'contextmenu';

/**
 * 下拉菜单位置
 */
export type DropdownPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';

/**
 * 下拉菜单项数据
 */
export interface DropdownItemData {
  /** 唯一标识 */
  key: string | number;
  /** 标签文本 */
  label: string;
  /** 图标URL */
  icon?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否分割线 */
  divided?: boolean;
  /** 子菜单 */
  children?: DropdownItemData[];
  /** 自定义数据 */
  data?: Record<string, unknown>;
}

/**
 * 下拉菜单组件属性接口
 */
export interface ExDropdownProps {
  /** 下拉菜单项列表 */
  items?: DropdownItemData[];
  /** 触发方式 */
  trigger?: DropdownTrigger;
  /** 弹出位置 */
  placement?: DropdownPlacement;
  /** 是否禁用 */
  disabled?: boolean;
  /** 菜单是否显示 */
  visible?: boolean;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 弹层与触发器之间的间距（像素） */
  offset?: number;
  /** 是否让弹层宽度匹配触发器宽度 */
  matchTriggerWidth?: boolean;
}

/**
 * 下拉菜单组件事件接口
 */
export interface ExDropdownEmits {
  /** 菜单项点击事件 */
  'item-click': [item: DropdownItemData];
  /** 显示状态改变事件 */
  'update:visible': [visible: boolean];
  /** 显示事件 */
  show: [];
  /** 隐藏事件 */
  hide: [];
}

/**
 * 下拉菜单组件暴露的方法接口
 */
export interface ExDropdownExposed {
  /** 显示下拉菜单 */
  show: () => void;
  /** 隐藏下拉菜单 */
  hide: () => void;
  /** 获取DOM元素 */
  getElement: () => HTMLDivElement | null;
}

/**
 * 下拉菜单项组件属性接口
 */
export interface ExDropdownItemProps {
  /** 标签文本 */
  label?: string;
  /** 图标URL */
  icon?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否分割线 */
  divided?: boolean;
}
