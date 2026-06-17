// ExUI Config Provider Types
// 全局配置提供者类型定义

import type { InjectionKey, Ref } from 'vue';
import type { SupportedLocale } from '../../locale';
import type { Theme } from '../../types/theme.d';

// 重新导出 Theme 类型
export type { Theme };

/**
 * 组件尺寸
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * 配置提供者属性
 */
export interface ExConfigProviderProps {
  /**
   * 主题
   */
  theme?: Theme;

  /**
   * 语言
   */
  locale?: SupportedLocale;

  /**
   * 全局组件尺寸
   */
  size?: ComponentSize;

  /**
   * 是否启用霓虹效果
   */
  neonEffect?: boolean;

  /**
   * 是否启用动画
   */
  animation?: boolean;

  /**
   * 命名空间（CSS 类名前缀）
   */
  namespace?: string;

  /**
   * z-index 基础值
   */
  zIndex?: number;

  /**
   * 自定义类名
   */
  class?: string | string[] | Record<string, boolean>;

  /**
   * 自定义样式
   */
  style?: string | Record<string, string | number>;
}

/**
 * 配置上下文
 */
export interface ConfigContext {
  /**
   * 主题
   */
  theme: Ref<Theme>;

  /**
   * 语言
   */
  locale: Ref<SupportedLocale>;

  /**
   * 全局组件尺寸
   */
  size: Ref<ComponentSize>;

  /**
   * 是否启用霓虹效果
   */
  neonEffect: Ref<boolean>;

  /**
   * 是否启用动画
   */
  animation: Ref<boolean>;

  /**
   * 命名空间
   */
  namespace: Ref<string>;

  /**
   * z-index 基础值
   */
  zIndex: Ref<number>;
}

/**
 * 配置注入键
 */
export const CONFIG_PROVIDER_INJECTION_KEY: InjectionKey<ConfigContext> =
  Symbol('exui-config-provider');

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Required<
  Omit<ExConfigProviderProps, 'class' | 'style'>
> = {
  theme: 'neon-blue',
  locale: 'en-US',
  size: 'medium',
  neonEffect: true,
  animation: true,
  namespace: 'ex',
  zIndex: 1000,
};
