/**
 * 在应用挂载前导入此模块可恢复主题并避免首屏主题闪烁。
 */
import {
  getPreferredSystemTheme,
  loadThemeFromStorage,
  observeSystemTheme,
  setTheme,
} from '../composables/useTheme';
import type { Theme } from '../types/theme';

export function initTheme(): Theme {
  const theme = loadThemeFromStorage() ?? getPreferredSystemTheme();
  setTheme(theme);
  return theme;
}

export function watchSystemTheme(callback?: (theme: Theme) => void): () => void {
  return observeSystemTheme(theme => {
    // 明确保存过的用户选择优先于后续系统偏好变化。
    if (loadThemeFromStorage()) return;
    setTheme(theme);
    callback?.(theme);
  }, false);
}

if (typeof document !== 'undefined') {
  initTheme();
}
