// ExUI Menu Component Types
// 菜单组件类型定义

import type { DropdownPlacement } from '../dropdown/types';

export type MenuMode = 'horizontal' | 'vertical' | 'inline';

// 菜单项数据接口
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  children?: MenuItem[];
  path?: string;
  [key: string]: unknown;
}

// ExMenu Props
export interface ExMenuProps {
  // 菜单模式
  mode?: MenuMode;
  // 当前激活的菜单项 key
  activeKey?: string;
  // 默认激活的菜单项 key
  defaultActiveKey?: string;
  // 当前展开的子菜单 key 数组
  openKeys?: string[];
  // 默认展开的子菜单 key 数组
  defaultOpenKeys?: string[];
  // 是否折叠（仅 inline 模式有效）
  collapsed?: boolean;
  // 是否可选择
  selectable?: boolean;
  // 菜单数据（可选，也可以使用插槽）
  items?: MenuItem[];
  // 是否响应式（移动端自动切换为折叠模式）
  responsive?: boolean;
  // 响应式断点（像素）
  breakpoint?: number;
  // 是否显示搜索框
  searchable?: boolean;
  // 无障碍标签
  ariaLabel?: string;
  // 自定义类名
  class?: string | string[] | Record<string, boolean>;
  // 自定义样式
  style?: string | Record<string, string | number>;
}

// ExMenu Emits
export interface ExMenuEmits {
  (e: 'update:activeKey', key: string): void;
  (e: 'update:openKeys', keys: string[]): void;
  (e: 'select', key: string, item: MenuItem): void;
  (e: 'click', key: string, item: MenuItem): void;
  (e: 'openChange', openKeys: string[]): void;
  (e: 'search', query: string): void;
}

// ExMenu Exposed
export interface ExMenuExposed {
  getActiveKey: () => string | undefined;
  getOpenKeys: () => string[];
  setActiveKey: (key: string) => void;
  setOpenKeys: (keys: string[]) => void;
  getElement: () => HTMLElement | null;
}

// ExMenuItem Props
export interface ExMenuItemProps {
  // 菜单项唯一标识
  itemKey: string;
  // 是否禁用
  disabled?: boolean;
  // 路径（用于路由）
  path?: string;
  // 自定义类名
  class?: string | string[] | Record<string, boolean>;
  // 自定义样式
  style?: string | Record<string, string | number>;
}

// ExMenuItem Emits
export interface ExMenuItemEmits {
  (e: 'click', key: string): void;
}

// ExMenuItem Exposed
export interface ExMenuItemExposed {
  getElement: () => HTMLElement | null;
}

// ExSubMenu Props
export interface ExSubMenuProps {
  // 子菜单唯一标识
  itemKey: string;
  // 子菜单标题
  title: string;
  // 是否禁用
  disabled?: boolean;
  // 弹出位置（horizontal 模式下有效）
  popupPlacement?: DropdownPlacement;
  // 自定义类名
  class?: string | string[] | Record<string, boolean>;
  // 自定义样式
  style?: string | Record<string, string | number>;
}

// ExSubMenu Emits
export interface ExSubMenuEmits {
  (e: 'titleClick', key: string): void;
  (e: 'openChange', open: boolean): void;
}

// ExSubMenu Exposed
export interface ExSubMenuExposed {
  isOpen: () => boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  getElement: () => HTMLElement | null;
}
