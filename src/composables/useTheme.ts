// ExUI Theme Composable
// 主题切换和管理的组合式 API

import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { Theme } from '../types/theme.d';

// 当前主题状态
const currentTheme = ref<Theme>('neon-blue');

// 主题变化回调
type ThemeChangeCallback = (theme: Theme) => void;
const themeChangeCallbacks: Set<ThemeChangeCallback> = new Set();

/**
 * 设置主题
 * @param theme 主题名称
 */
export function setTheme(theme: Theme): void {
  if (currentTheme.value === theme) return;

  currentTheme.value = theme;

  // 更新 document 的 data-theme 属性
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);

    // 触发主题变化事件
    const event = new CustomEvent('theme-change', { detail: { theme } });
    document.dispatchEvent(event);
  }

  // 执行回调
  themeChangeCallbacks.forEach(callback => callback(theme));
}

/**
 * 获取当前主题
 */
export function getTheme(): Theme {
  return currentTheme.value;
}

/**
 * 切换主题
 * @param themes 主题列表，如果不提供则在所有主题间循环
 */
export function toggleTheme(themes?: Theme[]): void {
  const allThemes: Theme[] = themes || ['neon-blue', 'neon-pink', 'dark', 'matrix', 'light'];
  const currentIndex = allThemes.indexOf(currentTheme.value);
  const nextIndex = (currentIndex + 1) % allThemes.length;
  const nextTheme = allThemes[nextIndex];
  if (nextTheme) {
    setTheme(nextTheme);
  }
}

/**
 * 监听主题变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function onThemeChange(callback: ThemeChangeCallback): () => void {
  themeChangeCallbacks.add(callback);
  return () => {
    themeChangeCallbacks.delete(callback);
  };
}

/**
 * 使用主题（组合式 API）
 */
export function useTheme(): {
  theme: Ref<Theme>;
  setTheme: (theme: Theme) => void;
  toggleTheme: (themes?: Theme[]) => void;
} {
  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
  };
}

/**
 * 根据系统偏好自动设置主题
 */
export function useSystemTheme(): (() => void) | undefined {
  if (typeof window === 'undefined') return;

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

  const updateTheme = () => {
    if (highContrastQuery.matches) {
      setTheme('matrix');
    } else if (darkModeQuery.matches) {
      setTheme('dark');
    } else {
      setTheme('neon-blue');
    }
  };

  // 初始设置
  updateTheme();

  // 监听变化
  darkModeQuery.addEventListener('change', updateTheme);
  highContrastQuery.addEventListener('change', updateTheme);

  // 返回清理函数
  return () => {
    darkModeQuery.removeEventListener('change', updateTheme);
    highContrastQuery.removeEventListener('change', updateTheme);
  };
}

/**
 * 保存主题到 localStorage
 */
export function saveThemeToStorage(theme: Theme): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('ex-ui-theme', theme);
  }
}

/**
 * 从 localStorage 加载主题
 */
export function loadThemeFromStorage(): Theme | null {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('ex-ui-theme');
    if (
      saved &&
      ['neon-blue', 'neon-pink', 'dark', 'matrix', 'high-contrast', 'light'].includes(saved)
    ) {
      return saved as Theme;
    }
  }
  return null;
}

/**
 * 使用持久化主题
 */
export function usePersistedTheme(): {
  theme: Ref<Theme>;
  setTheme: (theme: Theme) => void;
  toggleTheme: (themes?: Theme[]) => void;
} {
  // 从 storage 加载主题
  const savedTheme = loadThemeFromStorage();
  if (savedTheme) {
    setTheme(savedTheme);
  }

  // 监听主题变化并保存
  watch(currentTheme, newTheme => {
    saveThemeToStorage(newTheme);
  });

  return {
    theme: currentTheme,
    setTheme,
    toggleTheme,
  };
}

// 初始化：从 document 读取初始主题
if (typeof document !== 'undefined') {
  const initialTheme = document.documentElement.getAttribute('data-theme') as Theme;
  if (
    initialTheme &&
    ['neon-blue', 'neon-pink', 'dark', 'matrix', 'high-contrast', 'light'].includes(initialTheme)
  ) {
    currentTheme.value = initialTheme;
  }
}
