// ExUI Config Provider Types
// 全局配置提供者类型定义

import type { InjectionKey, Ref } from 'vue';
import type { SupportedLocale } from '../../locale';
import type { Theme, ThemeVariables } from '../../types/theme';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

// 重新导出 Theme 类型
export type { Theme };

/** 品牌或组件专用的 CSS 变量覆盖，保留变量名称和取值的类型提示。 */
export type ThemeOverrides = Partial<ThemeVariables>;

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

  /** 局部品牌变量；与父级覆盖合并并传递到 Teleport 浮层。 */
  themeOverrides?: ThemeOverrides;

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

  /** 当前子树合并后的品牌变量，兼容既有外部配置注入。 */
  themeOverrides?: Readonly<Ref<ThemeOverrides>>;

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
   * z-index 基础值
   */
  zIndex: Ref<number>;
}

/**
 * 配置注入键
 */
export const CONFIG_PROVIDER_INJECTION_KEY: InjectionKey<ConfigContext> =
  createSharedInjectionKey('config-provider');

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Required<Omit<ExConfigProviderProps, 'class' | 'style'>> = {
  theme: 'neon-blue',
  themeOverrides: Object.freeze({}),
  locale: 'en-US',
  size: 'medium',
  neonEffect: true,
  animation: true,
  zIndex: 1000,
};
