/**
 * ExUI Theme Initialization Script
 * 主题初始化脚本 - JavaScript 版本
 * 
 * 防止 FOUC (Flash of Unstyled Content)
 * 
 * 使用方式：
 * 1. 在 HTML <head> 中引入：<script src="/theme-init.js"></script>
 * 2. 或者内联到 HTML 中以获得最佳性能
 * 
 * @version 1.0.0
 * @license MIT
 */

(function () {
  'use strict';

  // 配置
  var VALID_THEMES = ['neon-blue', 'neon-pink', 'dark', 'high-contrast'];
  var DEFAULT_THEME = 'neon-blue';
  var STORAGE_KEY = 'ex-ui-theme';

  /**
   * 从 localStorage 读取保存的主题
   * @returns {string|null}
   */
  function getSavedTheme() {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return saved && isValidTheme(saved) ? saved : null;
    } catch (error) {
      console.warn('[ExUI] Failed to read theme from localStorage:', error);
      return null;
    }
  }

  /**
   * 检测系统主题偏好
   * @returns {string}
   */
  function getSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return DEFAULT_THEME;
    }

    try {
      // 检测高对比度偏好
      var highContrast = window.matchMedia('(prefers-contrast: high)');
      if (highContrast.matches) {
        return 'high-contrast';
      }

      // 检测暗色模式偏好
      var darkMode = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkMode.matches) {
        return 'dark';
      }

      return DEFAULT_THEME;
    } catch (error) {
      console.warn('[ExUI] Failed to detect system theme:', error);
      return DEFAULT_THEME;
    }
  }

  /**
   * 验证主题名称是否有效
   * @param {string} theme
   * @returns {boolean}
   */
  function isValidTheme(theme) {
    return VALID_THEMES.indexOf(theme) !== -1;
  }

  /**
   * 应用主题到 DOM
   * @param {string} theme
   */
  function applyTheme(theme) {
    if (typeof document === 'undefined') {
      return;
    }

    try {
      // 验证主题
      if (!isValidTheme(theme)) {
        theme = DEFAULT_THEME;
      }

      // 设置 data-theme 属性
      document.documentElement.setAttribute('data-theme', theme);

      // 设置 color-scheme（所有主题都是暗色）
      document.documentElement.style.colorScheme = 'dark';

      // 添加已加载标记
      document.documentElement.classList.add('ex-theme-loaded');
    } catch (error) {
      console.error('[ExUI] Failed to apply theme:', error);
    }
  }

  /**
   * 初始化主题
   * 优先级：localStorage > 系统偏好 > 默认主题
   */
  function initTheme() {
    var savedTheme = getSavedTheme();
    var theme = savedTheme || getSystemTheme();
    applyTheme(theme);
    return theme;
  }

  // 执行初始化
  var currentTheme = initTheme();

  // 暴露到全局（可选，用于调试）
  if (typeof window !== 'undefined') {
    window.__EXUI_THEME__ = {
      current: currentTheme,
      valid: VALID_THEMES,
      default: DEFAULT_THEME,
    };
  }
})();
