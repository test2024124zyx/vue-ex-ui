import type { App } from 'vue';
import { ref, computed } from 'vue';
import { createI18n, useI18n as useVueI18n } from 'vue-i18n';
import type { Composer, I18n, NamedValue } from 'vue-i18n';
import enUS from './en-US';
import zhCN from './zh-CN';
import { logger } from '../utils/logger';

export type Locale = typeof enUS;
export type LocaleKey = keyof Locale;
export type LocaleMessages = Record<string, unknown>;

// 支持的语言列表
export const SUPPORTED_LOCALES = {
  'en-US': enUS,
  'zh-CN': zhCN,
} as const;

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';
let _i18n: I18n | null = null;

// 当前语言状态 - 使用响应式
const currentLocale = ref<SupportedLocale>(DEFAULT_LOCALE);
const currentMessages = computed<Locale>(() => SUPPORTED_LOCALES[currentLocale.value]);

// 获取当前语言
export function getCurrentLocale(): SupportedLocale {
  return currentLocale.value;
}

// 设置语言
export function setLocale(locale: SupportedLocale): void {
  if (!SUPPORTED_LOCALES[locale]) {
    logger.warn(`Unsupported locale "${locale}", falling back to "${DEFAULT_LOCALE}"`);
    return;
  }
  if (_i18n) {
    (_i18n.global as Composer).locale.value = locale;
  } else {
    currentLocale.value = locale;
  }
}

// 获取翻译文本
export function t(key: string, params?: NamedValue): string {
  if (_i18n) {
    const composer = _i18n.global as Composer;
    return params ? composer.t(key, params) : composer.t(key);
  }
  const keys = key.split('.');
  let value: unknown = currentMessages.value;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      logger.warn(`Translation key "${key}" not found`);
      return key;
    }
  }
  if (typeof value !== 'string') {
    logger.warn(`Translation key "${key}" is not a string`);
    return key;
  }
  if (params) {
    return (value as string).replace(/\{(\w+)\}/g, (m, p) => (params[p] !== undefined ? String(params[p]) : m));
  }
  return value as string;
}

// 组合式 API
export function useI18n() {
  try {
    return useVueI18n();
  } catch {
    return { t, locale: currentLocale, setLocale, getCurrentLocale };
  }
}

export function useLocale(componentName: keyof Locale) {
  try {
    const composer = useVueI18n();
    const tWithScope = (key: string, params?: NamedValue) => {
      const fullKey = `${componentName}.${key}`;
      return params ? composer.t(fullKey, params) : composer.t(fullKey);
    };
    const messages = computed(() => {
      const all = composer.messages.value as unknown as Record<string, Record<string, unknown>>;
      const localeCode = composer.locale.value as string;
      const scoped = all[localeCode] as Record<string, unknown> | undefined;
      return (scoped?.[componentName as string] as Record<string, string>) || {};
    });
    return { t: tWithScope, messages };
  } catch {
    const componentMessages = computed(() => currentMessages.value[componentName] as Record<string, string>);
    const tWithScope = (key: string, params?: Record<string, unknown>) => t(`${componentName}.${key}`, params);
    return { t: tWithScope, messages: componentMessages };
  }
}

// Vue 插件
export interface LocaleProviderOptions {
  locale?: SupportedLocale;
  messages?: Partial<Locale>;
}

export function createLocaleProvider(options: LocaleProviderOptions = {}) {
  return {
    install(app: App) {
      const initial = options.locale ?? DEFAULT_LOCALE;
      const base = SUPPORTED_LOCALES as Record<SupportedLocale, Locale>;
      const messages: Record<SupportedLocale, Locale> = { ...base };
      if (options.messages) {
        messages[initial] = { ...(messages[initial] || {}), ...options.messages } as Locale;
      }
      _i18n = createI18n({ legacy: false, locale: initial, messages });
      app.use(_i18n);
    },
  };
}

// 导出语言包
export { enUS, zhCN };
export default {
  install: createLocaleProvider().install,
  t,
  setLocale,
  getCurrentLocale,
  useI18n,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
};
