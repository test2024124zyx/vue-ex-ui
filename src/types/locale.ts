// 国际化相关类型定义

export type ComponentLocale = Record<string, ComponentMessages>;

export interface LocaleConfig {
  locale: string;
  messages: Record<string, unknown>;
}

export interface I18nContext {
  t: (key: string, params?: Record<string, unknown>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  getCurrentLocale: () => string;
}

// 支持的语言类型
export type SupportedLocale = 'en-US' | 'zh-CN';

// 组件国际化键值类型
export interface ComponentMessages {
  [key: string]: string | ComponentMessages;
}

// 全局国际化消息类型
export interface GlobalMessages {
  common: ComponentMessages;
  button: ComponentMessages;
  input: ComponentMessages;
  divider: ComponentMessages;
  [key: string]: ComponentMessages;
}
