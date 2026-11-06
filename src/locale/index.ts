import type { App, ComputedRef, InjectionKey, Ref } from 'vue';
import { computed, getCurrentInstance, inject, ref, shallowRef, watch } from 'vue';
import enUS, { type BuiltInLocale } from './en-US';
import zhCN from './zh-CN';
import { logger } from '../utils/logger';
import { createDocumentRuntime, createSharedInjectionKey } from '../utils/shared-runtime';

export type Locale = BuiltInLocale;
export type LocaleKey = keyof Locale;
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export type LocaleMessages = DeepPartial<Locale>;
export type TranslationParams = Record<string, unknown>;

interface TranslationOptions {
  locale?: string;
}

interface LocaleComposer {
  locale: Ref<string>;
  messages: Readonly<Ref<Record<string, Record<string, unknown>>>>;
  t(key: string, params?: TranslationParams, options?: TranslationOptions): string;
  setLocale?: (locale: SupportedLocale) => void;
}

interface LocaleI18n {
  global: LocaleComposer;
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
  createSharedInjectionKey('locale');

/** createLocaleProvider 为单个 Vue App 提供的隔离翻译器。 */
export const LOCALE_COMPOSER_INJECTION_KEY: InjectionKey<LocaleComposer> =
  createSharedInjectionKey('locale-composer');

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';
interface LocaleRuntime {
  currentLocale: Ref<SupportedLocale>;
  composer?: LocaleComposer;
}

// 全局语言只在同一浏览器文档内共享，App 级 Provider 继续持有独立状态。
const getLocaleRuntime = createDocumentRuntime<LocaleRuntime>('locale', () => ({
  currentLocale: ref<SupportedLocale>(DEFAULT_LOCALE),
}));

// 获取当前语言
export function getCurrentLocale(): SupportedLocale {
  return getLocaleRuntime().currentLocale.value;
}

// 设置语言
export function setLocale(locale: SupportedLocale): void {
  updateLocale(getLocaleRuntime().currentLocale, locale);
}

function updateLocale(currentLocale: Ref<SupportedLocale>, locale: SupportedLocale): void {
  if (!SUPPORTED_LOCALES[locale]) {
    logger.warn(`Unsupported locale "${locale}", falling back to "${DEFAULT_LOCALE}"`);
    return;
  }
  currentLocale.value = locale;
}

const translateMessages = (
  messages: Record<SupportedLocale, Locale>,
  locale: string,
  key: string,
  params?: TranslationParams
): string => {
  const keys = key.split('.');
  let value: unknown = isSupportedLocale(locale) ? messages[locale] : undefined;

  for (const segment of keys) {
    if (
      value &&
      typeof value === 'object' &&
      Object.prototype.hasOwnProperty.call(value, segment)
    ) {
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

const translateBuiltIn = (locale: string, key: string, params?: TranslationParams): string =>
  translateMessages(SUPPORTED_LOCALES as Record<SupportedLocale, Locale>, locale, key, params);

const isMessageRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** 只合并内置语言包已经声明的键，并为每一层创建新对象。 */
const mergeLocaleMessages = (
  base: Record<string, unknown>,
  overrides: Record<string, unknown>,
  parentPath: readonly string[] = []
): Record<string, unknown> => {
  const merged = { ...base };
  for (const [key, overrideValue] of Object.entries(overrides)) {
    if (!Object.prototype.hasOwnProperty.call(base, key) || overrideValue === undefined) continue;
    const baseValue = base[key];
    const keyPath = [...parentPath, key];
    if (isMessageRecord(baseValue)) {
      if (!isMessageRecord(overrideValue)) {
        throw new TypeError(`自定义语言包 ${keyPath.join('.')} 必须是对象`);
      }
      merged[key] = mergeLocaleMessages(baseValue, overrideValue, keyPath);
      continue;
    }
    if (typeof baseValue === 'string') {
      if (typeof overrideValue !== 'string') {
        throw new TypeError(`自定义语言包 ${keyPath.join('.')} 必须是字符串`);
      }
      merged[key] = overrideValue;
      continue;
    }
    throw new TypeError(`内置语言包 ${keyPath.join('.')} 使用了不受支持的值类型`);
  }
  return merged;
};

// 获取翻译文本
export function t(key: string, params?: TranslationParams): string {
  return translateBuiltIn(getCurrentLocale(), key, params);
}

const getGlobalComposer = (): LocaleComposer => {
  const runtime = getLocaleRuntime();
  runtime.composer ??= {
    t: (key, params, options) =>
      translateBuiltIn(options?.locale ?? runtime.currentLocale.value, key, params),
    locale: runtime.currentLocale,
    messages: computed(
      () => SUPPORTED_LOCALES as unknown as Record<string, Record<string, unknown>>
    ),
    setLocale: locale => updateLocale(runtime.currentLocale, locale),
  };
  return runtime.composer;
};

/** 在 setup 中返回当前 App 的隔离翻译器，setup 外返回全局轻量翻译器。 */
export function useI18n(): LocaleComposer {
  const globalComposer = getGlobalComposer();
  if (!getCurrentInstance()) return globalComposer;
  const composer = inject(LOCALE_COMPOSER_INJECTION_KEY, globalComposer);
  const providedLocale = inject(LOCALE_INJECTION_KEY, null);
  if (!providedLocale) return composer;
  return {
    ...composer,
    // 写入原翻译器，读取仍遵循最近 Provider 的显式语言约束。
    locale: computed({
      get: () => providedLocale.value,
      set: value => {
        composer.locale.value = value;
      },
    }),
    // 将语言作为单次翻译选项传递，保留增强翻译能力且不改变其他子树。
    t: (key, params, options) =>
      composer.t(key, params, { ...options, locale: options?.locale ?? providedLocale.value }),
  };
}

export function useLocale(componentName: keyof Locale) {
  const providedLocale = getCurrentInstance() ? inject(LOCALE_INJECTION_KEY, null) : null;
  const appComposer = getCurrentInstance() ? inject(LOCALE_COMPOSER_INJECTION_KEY, null) : null;

  if (providedLocale) {
    const composer = appComposer ?? getGlobalComposer();
    const locale = computed(() => providedLocale.value);
    const tWithScope = (key: string, params?: TranslationParams) =>
      composer.t(`${componentName}.${key}`, params, { locale: providedLocale.value });
    const messages = computed(() => {
      const allMessages = appComposer
        ? appComposer.messages.value
        : (SUPPORTED_LOCALES as unknown as Record<string, Record<string, unknown>>);
      const scoped = allMessages[providedLocale.value];
      return (scoped?.[componentName as string] as Record<string, string>) || {};
    });
    return { t: tWithScope, messages, locale };
  }

  if (appComposer) {
    const composer = appComposer;
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
  const { currentLocale } = getLocaleRuntime();
  const componentMessages = computed(
    () => SUPPORTED_LOCALES[currentLocale.value][componentName] as Record<string, string>
  );
  const tWithScope = (key: string, params?: Record<string, unknown>) =>
    translateBuiltIn(currentLocale.value, `${componentName}.${key}`, params);
  const locale = computed(() => currentLocale.value);
  return { t: tWithScope, messages: componentMessages, locale };
}

// Vue 插件
export interface LocaleProviderOptions {
  locale?: SupportedLocale;
  messages?: LocaleMessages;
}

export function createLocaleProvider(options: LocaleProviderOptions = {}) {
  const initial = options.locale ?? DEFAULT_LOCALE;
  const base = SUPPORTED_LOCALES as Record<SupportedLocale, Locale>;
  const messages: Record<SupportedLocale, Locale> = { ...base };
  if (options.messages) {
    messages[initial] = mergeLocaleMessages(
      messages[initial] as unknown as Record<string, unknown>,
      options.messages as Record<string, unknown>
    ) as Locale;
  }

  return {
    install(app: App) {
      const locale = ref<SupportedLocale>(initial);
      const vueI18nComposer = shallowRef<LocaleComposer | null>(null);
      const messagesRef: ComputedRef<Record<string, Record<string, unknown>>> = computed(() =>
        vueI18nComposer.value
          ? vueI18nComposer.value.messages.value
          : (messages as unknown as Record<string, Record<string, unknown>>)
      );
      const composer: LocaleComposer = {
        locale,
        messages: messagesRef,
        t: (key, params, translationOptions) => {
          const activeComposer = vueI18nComposer.value;
          if (activeComposer) return activeComposer.t(key, params ?? {}, translationOptions);
          return translateMessages(
            messages,
            translationOptions?.locale ?? locale.value,
            key,
            params
          );
        },
        setLocale: nextLocale => {
          locale.value = nextLocale;
        },
      };

      app.provide(LOCALE_COMPOSER_INJECTION_KEY, composer);

      let disposed = false;
      const stopLocaleSync = watch(locale, value => {
        if (vueI18nComposer.value) vueI18nComposer.value.locale.value = value;
      });
      app.onUnmount(() => {
        disposed = true;
        stopLocaleSync();
        vueI18nComposer.value = null;
      });

      // 每个 App 独立动态加载可选依赖，绝不覆盖模块级或其他 App 的翻译状态。
      import('vue-i18n')
        .then(({ createI18n }) => {
          if (disposed) return;
          const i18n = createI18n({ legacy: false, locale: locale.value, messages }) as LocaleI18n;
          vueI18nComposer.value = i18n.global;
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
