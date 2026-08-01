// ExUI 全局主题类型与运行时配置。

/** 全局主题名称，只保留暗色和亮色两个赛博朋克主题。 */
export type Theme = 'neon-blue' | 'light';

/** 主题配置的公共元数据。 */
export interface ThemeConfig {
  /** 主题名称。 */
  name: Theme;
  /** 面向主题选择器的显示名称。 */
  displayName: string;
  /** 主题描述。 */
  description?: string;
  /** 是否为暗色主题。 */
  isDark: boolean;
}

/** 主题 CSS 变量的类型约束。 */
export interface ThemeVariables {
  // 主色、背景、文字和边框。
  '--ex-color-primary': string;
  '--ex-color-primary-hover': string;
  '--ex-color-primary-active': string;
  '--ex-color-secondary': string;
  '--ex-color-secondary-hover': string;
  '--ex-color-secondary-active': string;
  '--ex-color-accent': string;
  '--ex-color-bg-primary': string;
  '--ex-color-bg-secondary': string;
  '--ex-color-bg-tertiary': string;
  '--ex-color-bg-elevated': string;
  '--ex-color-bg-hover': string;
  '--ex-color-bg-active': string;
  '--ex-color-text-primary': string;
  '--ex-color-text-secondary': string;
  '--ex-color-text-tertiary': string;
  '--ex-color-text-disabled': string;
  '--ex-color-border-primary': string;
  '--ex-color-border-secondary': string;

  // 状态色。
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

  // 渐变、阴影和基础颜色。
  '--ex-gradient-primary': string;
  '--ex-gradient-secondary': string;
  '--ex-gradient-bg': string;
  '--ex-shadow-neon-sm': string;
  '--ex-shadow-neon-md': string;
  '--ex-shadow-neon-lg': string;
  '--ex-color-white': string;
  '--ex-color-black': string;
  '--ex-color-neon-blue-500': string;
  '--ex-color-neon-blue-600': string;
  '--ex-color-neon-pink-500': string;

  // 赛博纹理辅助变量。
  '--ex-color-cyber-green': string;
  '--ex-color-cyber-magenta': string;
  '--ex-color-cyber-cyan': string;
  '--ex-color-cyber-green-rgb': string;
  '--ex-color-cyber-magenta-rgb': string;
  '--ex-color-cyber-cyan-rgb': string;
  '--ex-cyber-grid-size': string;
  '--ex-cyber-grid-opacity': string;
  '--ex-cyber-scanline-opacity': string;
  '--ex-cyber-scanline-duration': string;

  // 允许组件继续声明以 --ex- 开头的专用变量，同时拒绝无命名空间变量。
  [key: `--ex-${string}`]: string;
}

/** 主题变更事件。 */
export interface ThemeChangeEvent {
  /** 旧主题。 */
  oldTheme: Theme;
  /** 新主题。 */
  newTheme: Theme;
  /** 变更时间戳。 */
  timestamp: number;
}

/** 全局主题名称的唯一来源，避免运行时枚举与类型声明漂移。 */
export const THEME_NAMES = ['neon-blue', 'light'] as const satisfies readonly Theme[];

/** 两个赛博朋克主题的运行时配置。 */
export const THEME_CONFIGS: Record<Theme, ThemeConfig> = {
  'neon-blue': {
    name: 'neon-blue',
    displayName: 'Cyber Dark',
    description: '深色赛博朋克主题，以霓虹蓝和紫色作为主视觉。',
    isDark: true,
  },
  light: {
    name: 'light',
    displayName: 'Cyber Light',
    description: '亮色赛博朋克主题，以清晰的深色文字和收敛的霓虹色作为主视觉。',
    isDark: false,
  },
};

/** 获取主题配置。 */
export function getThemeConfig(theme: Theme): ThemeConfig {
  return THEME_CONFIGS[theme];
}

/** 判断主题是否为暗色主题。 */
export function isDarkTheme(theme: Theme): boolean {
  return THEME_CONFIGS[theme].isDark;
}
