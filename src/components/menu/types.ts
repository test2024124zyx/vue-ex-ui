import type { VNodeChild } from 'vue';
import type { DropdownPlacement } from '../dropdown/types';
import type { LinkTarget } from '../link/types';

/** 菜单真实支持的布局模式。 */
export type MenuMode = 'horizontal' | 'vertical' | 'inline';

/** 数据驱动菜单节点；children 可递归到任意深度。 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  children?: MenuItem[];
  /** 叶节点的原生导航地址。 */
  href?: string;
  target?: LinkTarget;
  rel?: string;
  /** 横向弹出菜单位置。 */
  popupPlacement?: DropdownPlacement;
}

/** 菜单项交互事件的稳定信息对象。 */
export interface MenuSelectInfo {
  key: string;
  item?: MenuItem;
  event: MouseEvent;
}

export interface ExMenuProps {
  mode?: MenuMode;
  /** 受控激活键；undefined 时组件自行管理。 */
  activeKey?: string;
  defaultActiveKey?: string;
  /** 受控展开键；undefined 时组件自行管理。 */
  openKeys?: string[];
  defaultOpenKeys?: string[];
  /** 仅 inline 模式生效。 */
  collapsed?: boolean;
  selectable?: boolean;
  items?: MenuItem[];
  searchable?: boolean;
}

export interface ExMenuEmits {
  'update:activeKey': [key: string];
  'update:openKeys': [keys: string[]];
  select: [info: MenuSelectInfo];
  'item-click': [info: MenuSelectInfo];
  'open-change': [openKeys: string[]];
  search: [query: string];
}

export interface ExMenuSlots {
  default?: () => VNodeChild;
}

export interface ExMenuExposed {
  getActiveKey: () => string | undefined;
  getOpenKeys: () => string[];
  /** 与用户选择相同，受控模式只发出更新请求。 */
  setActiveKey: (key: string) => void;
  setOpenKeys: (keys: string[]) => void;
  getElement: () => HTMLElement | null;
}

export interface ExMenuItemProps {
  itemKey: string;
  disabled?: boolean;
  href?: string;
  target?: LinkTarget;
  rel?: string;
}

export interface ExMenuItemEmits {
  click: [key: string, event: MouseEvent];
}

export interface ExMenuItemSlots {
  default?: () => VNodeChild;
  icon?: () => VNodeChild;
}

export interface ExMenuItemExposed {
  getElement: () => HTMLLIElement | null;
  getActionElement: () => HTMLAnchorElement | HTMLButtonElement | null;
}

export interface ExSubMenuProps {
  itemKey: string;
  title: string;
  disabled?: boolean;
  popupPlacement?: DropdownPlacement;
}

export interface ExSubMenuEmits {
  'title-click': [key: string, event: MouseEvent];
  'open-change': [open: boolean];
}

export interface ExSubMenuSlots {
  default?: () => VNodeChild;
  icon?: () => VNodeChild;
  title?: () => VNodeChild;
}

export interface ExSubMenuExposed {
  isOpen: () => boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  getElement: () => HTMLLIElement | null;
}
