export type DropdownTrigger = 'hover' | 'click' | 'contextmenu';

export type DropdownPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/** 数据驱动菜单项。 */
export interface DropdownItemData {
  /** 唯一标识。 */
  key: string | number;
  /** 标签文本。 */
  label: string;
  /** 装饰性图标地址。 */
  icon?: string;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 是否在菜单项前显示分隔线。 */
  divided?: boolean;
  /** 随 item-click 原样返回的自定义数据。 */
  data?: Record<string, unknown>;
}

/** 绑定到实际触发控件的 ARIA 属性。 */
export interface DropdownTriggerAttributes {
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-disabled': true | undefined;
}

/** 默认插槽参数。 */
export interface DropdownTriggerSlotProps {
  open: boolean;
  disabled: boolean;
  triggerProps: DropdownTriggerAttributes;
}

/** 下拉菜单属性。 */
export interface ExDropdownProps {
  /** 数据驱动菜单项。 */
  items?: DropdownItemData[];
  /** 触发方式。 */
  trigger?: DropdownTrigger;
  /** 首选弹出位置，空间不足时可自动翻转。 */
  placement?: DropdownPlacement;
  /** 是否禁用打开请求。 */
  disabled?: boolean;
  /** 受控显示状态；未传入时组件自行管理状态。 */
  visible?: boolean;
  /** 菜单的显式无障碍名称。 */
  ariaLabel?: string;
  /** 弹层与触发器之间的非负像素间距。 */
  offset?: number;
  /** 是否让弹层精确匹配触发器宽度。 */
  matchTriggerWidth?: boolean;
  /** 是否在首选方向空间不足时翻转。 */
  flip?: boolean;
  /** 浮层与视口边缘的安全距离。 */
  viewportPadding?: number;
  /** hover 打开延迟，单位毫秒。 */
  showDelay?: number;
  /** hover 关闭延迟，单位毫秒。 */
  hideDelay?: number;
  /** 选择菜单项后是否关闭。 */
  hideOnClick?: boolean;
  /** 自定义层级；未设置时跟随全局层级。 */
  zIndex?: number;
}

/** 下拉菜单事件。 */
export interface ExDropdownEmits {
  'item-click': [item: DropdownItemData];
  'update:visible': [visible: boolean];
  show: [];
  hide: [];
}

/** 下拉菜单公开方法。 */
export interface ExDropdownExposed {
  /** 请求显示。 */
  show: () => void;
  /** 请求隐藏。 */
  hide: () => void;
  /** 立即重新计算浮层位置。 */
  updatePosition: () => void;
  /** 获取组件根元素。 */
  getElement: () => HTMLDivElement | null;
}

/** 自定义下拉菜单项属性。 */
export interface ExDropdownItemProps {
  /** 标签文本。 */
  label?: string;
  /** 装饰性图标地址。 */
  icon?: string;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 是否在菜单项前显示分隔线。 */
  divided?: boolean;
  /** 元素 id，用于 aria-activedescendant 关联。 */
  id?: string;
}

/** 自定义下拉菜单项事件。 */
export interface ExDropdownItemEmits {
  click: [event: MouseEvent];
}
