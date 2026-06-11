// ExUI Theme Type Definitions
// 主题系统的 TypeScript 类型定义

/**
 * 主题名称
 */
export type Theme = 'neon-blue' | 'neon-pink' | 'dark' | 'high-contrast';

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: Theme;
  /** 主题显示名称 */
  displayName: string;
  /** 主题描述 */
  description?: string;
  /** 是否为暗色主题 */
  isDark: boolean;
  /** 是否为高对比度主题 */
  isHighContrast: boolean;
}

/**
 * 主题变量接口
 */
export interface ThemeVariables {
  // 主色调
  '--ex-color-primary': string;
  '--ex-color-primary-hover': string;
  '--ex-color-primary-active': string;
  '--ex-color-secondary': string;
  '--ex-color-secondary-hover': string;
  '--ex-color-secondary-active': string;
  '--ex-color-accent': string;

  // 背景色
  '--ex-color-bg-primary': string;
  '--ex-color-bg-secondary': string;
  '--ex-color-bg-tertiary': string;
  '--ex-color-bg-elevated': string;
  '--ex-color-bg-hover': string;
  '--ex-color-bg-active': string;

  // 文本色
  '--ex-color-text-primary': string;
  '--ex-color-text-secondary': string;
  '--ex-color-text-tertiary': string;
  '--ex-color-text-disabled': string;

  // 边框色
  '--ex-color-border-primary': string;
  '--ex-color-border-secondary': string;

  // 状态色
  '--ex-color-success': string;
  '--ex-color-success-hover': string;
  '--ex-color-success-active': string;
  '--ex-color-warning': string;
  '--ex-color-warning-hover': string;
  '--ex-color-warning-active': string;
  '--ex-color-error': string;
  '--ex-color-danger': string;
  '--ex-color-danger-hover': string;
  '--ex-color-danger-active': string;
  '--ex-color-info': string;
  '--ex-color-info-hover': string;
  '--ex-color-info-active': string;

  // 渐变
  '--ex-gradient-primary': string;
  '--ex-gradient-secondary': string;
  '--ex-gradient-bg': string;

  // 阴影
  '--ex-shadow-neon-sm': string;
  '--ex-shadow-neon-md': string;
  '--ex-shadow-neon-lg': string;

  // 特殊颜色
  '--ex-color-white': string;
  '--ex-color-black': string;
  '--ex-color-neon-blue-500': string;
  '--ex-color-neon-blue-600': string;
  '--ex-color-neon-pink-500': string;

  // RGB 格式
  '--ex-color-bg-primary-rgb': string;
  '--ex-color-bg-secondary-rgb': string;
  '--ex-color-bg-tertiary-rgb': string;
  '--ex-color-neon-blue-500-rgb': string;

  // 其他变量...
  [key: string]: string;
}

/**
 * 自定义主题配置
 */
export interface CustomThemeConfig {
  /** 基础主题（继承） */
  base?: Theme;
  /** 主题名称 */
  name: string;
  /** 主题显示名称 */
  displayName: string;
  /** 主题描述 */
  description?: string;
  /** 自定义变量 */
  variables: Partial<ThemeVariables>;
}

/**
 * 主题切换选项
 */
export interface ThemeSwitchOptions {
  /** 是否启用过渡动画 */
  transition?: boolean;
  /** 过渡持续时间（毫秒） */
  transitionDuration?: number;
  /** 是否保存到 localStorage */
  persist?: boolean;
  /** 是否触发事件 */
  emitEvent?: boolean;
}

/**
 * 主题变化事件
 */
export interface ThemeChangeEvent {
  /** 旧主题 */
  oldTheme: Theme;
  /** 新主题 */
  newTheme: Theme;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 预定义主题配置
 */
export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  'neon-blue': {
    name: 'neon-blue',
    displayName: 'Neon Blue',
    description: 'ClutchZone 游戏风格主题 - 霓虹蓝主导',
    isDark: true,
    isHighContrast: false,
  },
  'neon-pink': {
    name: 'neon-pink',
    displayName: 'Neon Pink',
    description: 'ClutchZone 游戏风格主题 - 霓虹粉主导',
    isDark: true,
    isHighContrast: false,
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    description: '纯暗黑主题 - 无霓虹效果',
    isDark: true,
    isHighContrast: false,
  },
  'high-contrast': {
    name: 'high-contrast',
    displayName: 'High Contrast',
    description: '高对比度主题 - 无障碍友好',
    isDark: true,
    isHighContrast: true,
  },
};

/**
 * 获取主题配置
 */
export function getThemeConfig(theme: Theme): ThemeConfig {
  return THEME_CONFIGS[theme];
}

/**
 * 判断是否为暗色主题
 */
export function isDarkTheme(theme: Theme): boolean {
  return THEME_CONFIGS[theme].isDark;
}

/**
 * 判断是否为高对比度主题
 */
export function isHighContrastTheme(theme: Theme): boolean {
  return THEME_CONFIGS[theme].isHighContrast;
}
