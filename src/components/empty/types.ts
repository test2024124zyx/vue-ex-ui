export type EmptySize = 'small' | 'medium' | 'large'

/**
 * 空状态类型
 */
export type EmptyType = 'default' | 'no-data' | 'no-result' | 'error' | 'network-error';

/**
 * 空状态图片配置
 */
export interface EmptyImageConfig {
  url?: string;
  content?: string;
  description?: string;
  size?: number;
  width?: number;
  height?: number;
}

/**
 * 空状态配置映射
 */
export type EmptyConfigMap = Record<EmptyType | 'search' | 'network' | 'data' | 'permission' | 'maintenance', EmptyImageConfig>;

export interface EmptyProps {
  /**
   * 图片地址
   */
  image?: string
  /**
   * 图片尺寸
   */
  imageSize?: EmptySize | number
  /**
   * 描述文字
   */
  description?: string
  /**
   * 是否显示默认图片
   */
  showImage?: boolean
}

export interface EmptySlots {
  /**
   * 自定义图片
   */
  image?: () => unknown
  /**
   * 自定义描述
   */
  description?: () => unknown
  /**
   * 自定义操作按钮
   */
  default?: () => unknown
}
