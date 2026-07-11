import type { App, InjectionKey, Ref } from 'vue';
import { computed, inject, ref, shallowRef } from 'vue';
import enUS from './en-US';
import zhCN from './zh-CN';
import { logger } from '../utils/logger';

export type Locale = typeof enUS;
export type LocaleKey = keyof Locale;
export type LocaleMessages = Record<string, unknown>;
export type TranslationParams = Record<string, unknown>;

interface LocaleComposer {
  locale: { value: string };
  messages: { value: Record<string, Record<string, unknown>> };
  t(key: string, params?: TranslationParams): string;
}

interface LocaleI18n {
  global: LocaleComposer;
  install(app: App): void;
}

// 支持的语言列表
export const SUPPORTED_LOCALES = {
  'en-US': enUS,
  'zh-CN': zhCN,
} as const;

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

const isSupportedLocale = (value: string): value is SupportedLocale =>
  Object.prototype.hasOwnProperty.call(SUPPORTED_LOCALES, value);

/** ConfigProvider 用于隔离子树语言的注入键。 */
export const LOCALE_INJECTION_KEY: InjectionKey<Readonly<Ref<SupportedLocale>>> =
  Symbol('exui-locale');

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';
// 用 shallowRef 持有 vue-i18n 实例（可能异步加载完成）。设为响应式后，
// 当实例就绪时，读取过它的 t()/模板会自动重新求值，无需手动刷新。
const _i18n = shallowRef<LocaleI18n | null>(null);

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
  if (_i18n.value) {
    _i18n.value.global.locale.value = locale;
  } else {
    currentLocale.value = locale;
  }
}

const translateBuiltIn = (
  locale: SupportedLocale,
  key: string,
  params?: TranslationParams
): string => {
  const keys = key.split('.');
  let value: unknown = SUPPORTED_LOCALES[locale];

  for (const segment of keys) {
    if (value && typeof value === 'object' && segment in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[segment];
    } else {
      logger.warn(`Translation key "${key}" not found`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    logger.warn(`Translation key "${key}" is not a string`);
    return key;
  }

  return params
    ? value.replace(/\{(\w+)\}/g, (match, name: string) =>
        params[name] !== undefined ? String(params[name]) : match
      )
    : value;
};

// 获取翻译文本
export function t(key: string, params?: TranslationParams): string {
  if (_i18n.value) {
    const composer = _i18n.value.global;
    return params ? composer.t(key, params) : composer.t(key);
  }
  return translateBuiltIn(currentLocale.value, key, params);
}

// 组合式 API
// 说明：以 _i18n 实例是否就绪作为「是否走 vue-i18n」的判断依据——
// 无需调用 vue-i18n 的 useI18n（那需要静态依赖），未安装时返回内置实现。
// 返回对象里的 t 始终是模块级响应式 t()，即便 vue-i18n 稍后异步就绪也能自动生效。
export function useI18n() {
  if (_i18n.value) {
    return _i18n.value.global;
  }
  return { t, locale: currentLocale, setLocale, getCurrentLocale };
}

export function useLocale(componentName: keyof Locale) {
  const providedLocale = inject(LOCALE_INJECTION_KEY, null);

  if (providedLocale) {
    const locale = computed(() => providedLocale.value);
    const tWithScope = (key: string, params?: TranslationParams) =>
      translateBuiltIn(providedLocale.value, `${componentName}.${key}`, params);
    const messages = computed(
      () => SUPPORTED_LOCALES[providedLocale.value][componentName] as Record<string, string>
    );
    return { t: tWithScope, messages, locale };
  }

  if (_i18n.value) {
    const composer = _i18n.value.global;
    const locale = computed<SupportedLocale>(() => {
      const value = composer.locale.value;
      return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
    });
    const tWithScope = (key: string, params?: TranslationParams) => {
      const fullKey = `${componentName}.${key}`;
      return params ? composer.t(fullKey, params) : composer.t(fullKey);
    };
    const messages = computed(() => {
      const all = composer.messages.value as unknown as Record<string, Record<string, unknown>>;
      const localeCode = composer.locale.value as string;
      const scoped = all[localeCode] as Record<string, unknown> | undefined;
      return (scoped?.[componentName as string] as Record<string, string>) || {};
    });
    return { t: tWithScope, messages, locale };
  }
  const componentMessages = computed(
    () => currentMessages.value[componentName] as Record<string, string>
  );
  const tWithScope = (key: string, params?: Record<string, unknown>) =>
    t(`${componentName}.${key}`, params);
  const locale = computed(() => currentLocale.value);
  return { t: tWithScope, messages: componentMessages, locale };
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
      // 同步反映初始语言，保证 vue-i18n 异步就绪前内置翻译也用对语言
      currentLocale.value = initial;
      // 动态加载 vue-i18n（可选依赖）。未安装时静默降级到内置翻译。
      import('vue-i18n')
        .then(({ createI18n }) => {
          _i18n.value = createI18n({ legacy: false, locale: initial, messages }) as LocaleI18n;
          app.use(_i18n.value);
        })
        .catch(() => {
          logger.warn(
            'createLocaleProvider() 需要安装 vue-i18n。未检测到该依赖，已回退到内置轻量翻译实现。'
          );
        });
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
