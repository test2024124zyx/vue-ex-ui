/**
 * 标签页位置
 */
export type TabsPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * 标签页类型
 */
export type TabsType = 'line' | 'card' | 'button';

/**
 * 标签页尺寸
 */
export type TabsSize = 'small' | 'medium' | 'large';

/**
 * 标签页组件属性接口
 */
export interface ExTabsProps {
  /** 当前激活的标签页名称 */
  modelValue?: string | number;
  /** 标签页类型 */
  type?: TabsType;
  /** 标签页位置 */
  position?: TabsPosition;
  /** 标签页尺寸 */
  size?: TabsSize;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否可添加 */
  addable?: boolean;
  /** 是否可编辑（可添加和关闭） */
  editable?: boolean;
  /** 是否动画 */
  animated?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 标签页组件事件接口
 */
export interface ExTabsEmits {
  /** 更新当前激活的标签页 */
  'update:modelValue': [value: string | number];
  /** 标签页切换事件 */
  change: [name: string | number];
  /** 标签页点击事件 */
  'tab-click': [name: string | number, event: MouseEvent];
  /** 标签页关闭事件 */
  'tab-remove': [name: string | number];
  /** 标签页添加事件 */
  'tab-add': [];
}

/**
 * 标签页组件暴露的方法接口
 */
export interface ExTabsExposed {
  /** 获取标签页DOM元素 */
  getElement: () => HTMLDivElement | null;
}

/**
 * 标签面板组件属性接口
 */
export interface ExTabPaneProps {
  /** 标签页名称（唯一标识） */
  name: string | number;
  /** 标签页标题 */
  label?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否懒加载 */
  lazy?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 标签面板组件暴露的方法接口
 */
export interface ExTabPaneExposed {
  /** 获取面板DOM元素 */
  getElement: () => HTMLDivElement | null;
}
