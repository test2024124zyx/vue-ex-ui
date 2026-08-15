import { getCurrentScope, onScopeDispose, readonly, ref, watch } from 'vue';
import type { DeepReadonly, Ref } from 'vue';
import { isDarkTheme, THEME_NAMES } from '../types/theme';
import type { Theme } from '../types/theme';

export const DEFAULT_THEME: Theme = 'neon-blue';
export const THEME_STORAGE_KEY = 'ex-ui-theme';
export const VALID_THEMES: readonly Theme[] = Object.freeze([...THEME_NAMES]);

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

/** 设置全局主题，并同步 DOM、颜色模式和变更通知。 */
export function setTheme(theme: Theme): void {
  if (!isTheme(theme)) {
    throw new TypeError(`[ExUI] 未知主题：${String(theme)}`);
  }

  const oldTheme = currentTheme.value;
  const changed = oldTheme !== theme;
  currentTheme.value = theme;
  // 即使主题名称未变化，也重新同步 DOM，修复宿主代码误删属性的情况。
  applyThemeToDocument(theme);

  if (!changed) return;

  if (typeof document !== 'undefined') {
    document.dispatchEvent(
      new CustomEvent('ex-theme-change', {
        detail: { oldTheme, newTheme: theme, timestamp: Date.now() },
      })
    );
  }

  // 使用快照遍历，允许回调在执行过程中安全取消自身订阅。
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

/** 将系统暗色偏好映射到赛博暗色主题，亮色偏好映射到赛博亮色主题。 */
export function getPreferredSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return DEFAULT_THEME;
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'neon-blue' : 'light';
  } catch {
    return DEFAULT_THEME;
  }
}

/** 监听系统颜色偏好，返回可重复调用的清理函数。 */
export function observeSystemTheme(callback: (theme: Theme) => void, immediate = true): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    if (immediate) callback(DEFAULT_THEME);
    return () => undefined;
  }

  let colorSchemeQuery: MediaQueryList;

  try {
    colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  } catch {
    if (immediate) callback(DEFAULT_THEME);
    return () => undefined;
  }

  const updateTheme = () => callback(getPreferredSystemTheme());
  colorSchemeQuery.addEventListener('change', updateTheme);

  let active = true;
  const stop = () => {
    if (!active) return;
    active = false;
    colorSchemeQuery.removeEventListener('change', updateTheme);
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

  // Vue 会把同步创建的监听器绑定到当前组件作用域，卸载时自动停止。
  watch(currentTheme, saveThemeToStorage);

  return { theme: readonlyTheme, setTheme, toggleTheme };
}
