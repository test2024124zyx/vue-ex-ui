/**
 * ExUI Theme Initialization Utility
 * 主题初始化工具 - TypeScript 版本
 *
 * 用于在应用启动前初始化主题，防止 FOUC (Flash of Unstyled Content)
 *
 * @example
 * // 在 main.ts 之前导入
 * import './utils/theme-init'
 */

import type { Theme } from '../types/theme.d';

/**
 * 有效的主题列表
 */
const VALID_THEMES: Theme[] = [
  'neon-blue',
  'neon-pink',
  'dark',
  'matrix',
  'high-contrast',
  'light',
];

/**
 * 默认主题
 */
const DEFAULT_THEME: Theme = 'neon-blue';

/**
 * localStorage 存储键名
 */
const STORAGE_KEY = 'ex-ui-theme';

/**
 * 从 localStorage 读取保存的主题
 */
function getSavedTheme(): Theme | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isValidTheme(saved as Theme) ? (saved as Theme) : null;
  } catch (_error) {
    // 静默处理，localStorage 可能不可用
    return null;
  }
}

/**
 * 检测系统主题偏好
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return DEFAULT_THEME;
  }

  try {
    // 检测高对比度偏好
    const highContrast = window.matchMedia('(prefers-contrast: high)');
    if (highContrast.matches) {
      return 'matrix';
    }

    // 检测暗色模式偏好
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkMode.matches) {
      return 'dark';
    }

    return DEFAULT_THEME;
  } catch (_error) {
    // 静默处理，返回默认主题
    return DEFAULT_THEME;
  }
}

/**
 * 验证主题名称是否有效
 */
function isValidTheme(theme: string): theme is Theme {
  return VALID_THEMES.includes(theme as Theme);
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }

  try {
    // 设置 data-theme 属性
    document.documentElement.setAttribute('data-theme', theme);

    // 设置 color-scheme（所有主题都是暗色）
    document.documentElement.style.colorScheme = 'dark';

    // 添加已加载标记
    document.documentElement.classList.add('ex-theme-loaded');
  } catch (error) {
    // 静默处理主题应用失败
    if (import.meta.env.DEV) {
      console.error('[ExUI] Failed to apply theme:', error);
    }
  }
}

/**
 * 初始化主题
 * 优先级：localStorage > 系统偏好 > 默认主题
 */
export function initTheme(): Theme {
  const savedTheme = getSavedTheme();
  const theme = savedTheme || getSystemTheme();

  applyTheme(theme);

  return theme;
}

/**
 * 监听系统主题变化（可选）
 */
export function watchSystemTheme(callback?: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

  const handleChange = () => {
    // 只在没有保存的主题时才响应系统变化
    const savedTheme = getSavedTheme();
    if (!savedTheme) {
      const newTheme = getSystemTheme();
      applyTheme(newTheme);
      callback?.(newTheme);
    }
  };

  darkModeQuery.addEventListener('change', handleChange);
  highContrastQuery.addEventListener('change', handleChange);

  // 返回清理函数
  return () => {
    darkModeQuery.removeEventListener('change', handleChange);
    highContrastQuery.removeEventListener('change', handleChange);
  };
}

// 自动初始化（如果作为模块导入）
if (typeof document !== 'undefined') {
  initTheme();
}
