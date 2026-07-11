import { getCurrentScope, onScopeDispose, readonly, ref, watch } from 'vue';
import type { DeepReadonly, Ref } from 'vue';
import { isDarkTheme, THEME_CONFIGS } from '../types/theme';
import type { Theme } from '../types/theme';

export const DEFAULT_THEME: Theme = 'neon-blue';
export const THEME_STORAGE_KEY = 'ex-ui-theme';
export const VALID_THEMES = Object.freeze(Object.keys(THEME_CONFIGS) as Theme[]);

type ThemeChangeCallback = (theme: Theme) => void;
type ReadonlyThemeRef = DeepReadonly<Ref<Theme>>;

const readDocumentTheme = (): Theme => {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const theme = document.documentElement.getAttribute('data-theme');
  return isTheme(theme) ? theme : DEFAULT_THEME;
};

const currentTheme = ref<Theme>(readDocumentTheme());
const readonlyTheme = readonly(currentTheme);
const themeChangeCallbacks = new Set<ThemeChangeCallback>();

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && VALID_THEMES.includes(value as Theme);
}

const applyThemeToDocument = (theme: Theme): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = isDarkTheme(theme) ? 'dark' : 'light';
  root.classList.add('ex-theme-loaded');
};

/**
 * 设置全局主题，并同步响应式状态、DOM 颜色模式及变化通知。
 */
export function setTheme(theme: Theme): void {
  if (!isTheme(theme)) {
    throw new TypeError(`[ExUI] 未知主题：${String(theme)}`);
  }

  const oldTheme = currentTheme.value;
  const changed = oldTheme !== theme;
  currentTheme.value = theme;
  // 即使状态未变化也重新同步 DOM，修复宿主代码意外删除属性的情况。
  applyThemeToDocument(theme);

  if (!changed) return;

  if (typeof document !== 'undefined') {
    document.dispatchEvent(
      new CustomEvent('ex-theme-change', {
        detail: { oldTheme, newTheme: theme, timestamp: Date.now() },
      })
    );
  }

  // 使用快照遍历，允许回调在执行期间安全取消自身订阅。
  for (const callback of [...themeChangeCallbacks]) {
    callback(theme);
  }
}

export function getTheme(): Theme {
  return currentTheme.value;
}

export function toggleTheme(themes: readonly Theme[] = VALID_THEMES): void {
  if (themes.length === 0) return;

  for (const theme of themes) {
    if (!isTheme(theme)) {
      throw new TypeError(`[ExUI] 主题列表包含未知主题：${String(theme)}`);
    }
  }

  const currentIndex = themes.indexOf(currentTheme.value);
  const nextTheme = themes[(currentIndex + 1) % themes.length] ?? themes[0];
  if (nextTheme) setTheme(nextTheme);
}

export function onThemeChange(callback: ThemeChangeCallback): () => void {
  themeChangeCallbacks.add(callback);
  const stop = () => themeChangeCallbacks.delete(callback);

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return stop;
}

export function useTheme(): {
  theme: ReadonlyThemeRef;
  setTheme: typeof setTheme;
  toggleTheme: typeof toggleTheme;
} {
  return { theme: readonlyTheme, setTheme, toggleTheme };
}

export function getPreferredSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return DEFAULT_THEME;
  }

  try {
    if (window.matchMedia('(prefers-contrast: high)').matches) return 'matrix';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    return DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

/**
 * 观察系统主题。返回的清理函数可重复调用，且组合式作用域销毁时会自动解绑。
 */
export function observeSystemTheme(callback: (theme: Theme) => void, immediate = true): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    if (immediate) callback(DEFAULT_THEME);
    return () => undefined;
  }

  let darkModeQuery: MediaQueryList;
  let highContrastQuery: MediaQueryList;

  try {
    darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    highContrastQuery = window.matchMedia('(prefers-contrast: high)');
  } catch {
    if (immediate) callback(DEFAULT_THEME);
    return () => undefined;
  }

  const updateTheme = () => callback(getPreferredSystemTheme());
  darkModeQuery.addEventListener('change', updateTheme);
  highContrastQuery.addEventListener('change', updateTheme);

  let active = true;
  const stop = () => {
    if (!active) return;
    active = false;
    darkModeQuery.removeEventListener('change', updateTheme);
    highContrastQuery.removeEventListener('change', updateTheme);
  };

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }
  if (immediate) updateTheme();

  return stop;
}

export function useSystemTheme(): () => void {
  return observeSystemTheme(setTheme);
}

export function saveThemeToStorage(theme: Theme): void {
  if (!isTheme(theme) || typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 隐私模式或存储配额限制不应阻断主题切换。
  }
}

export function loadThemeFromStorage(): Theme | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(savedTheme) ? savedTheme : null;
  } catch {
    return null;
  }
}

export function usePersistedTheme(): {
  theme: ReadonlyThemeRef;
  setTheme: typeof setTheme;
  toggleTheme: typeof toggleTheme;
} {
  const savedTheme = loadThemeFromStorage();
  if (savedTheme) setTheme(savedTheme);

  // Vue 会把同步创建的监听器绑定到当前组件作用域，并在卸载时自动停止。
  watch(currentTheme, saveThemeToStorage);

  return { theme: readonlyTheme, setTheme, toggleTheme };
}
