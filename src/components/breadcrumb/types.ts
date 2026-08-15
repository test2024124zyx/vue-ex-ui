export interface BreadcrumbItem {
  /** 面包屑项的文本 */
  label: string;
  /** 面包屑项的路径 */
  path?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}

export interface BreadcrumbProps {
  /** 面包屑数据 */
  items?: BreadcrumbItem[];
  /** 分隔符 */
  separator?: string;
  /** 最大显示项数 */
  maxItems?: number;
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否可点击 */
  clickable?: boolean;
}

export interface BreadcrumbItemProps {
  /** 面包屑项数据 */
  item: BreadcrumbItem;
  /** 项目索引 */
  index: number;
  /** 是否为最后一项 */
  isLast?: boolean;
  /** 分隔符 */
  separator?: string;
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否可点击 */
  clickable?: boolean;
}

export interface BreadcrumbEmits {
  /** 点击面包屑项时触发 */
  (e: 'click', item: BreadcrumbItem, index: number): void;
}

export interface BreadcrumbItemEmits {
  /** 点击面包屑项时触发 */
  (e: 'click', item: BreadcrumbItem): void;
}
