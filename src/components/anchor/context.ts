import type { InjectionKey, Ref } from 'vue';
import type { AnchorItem } from './types';

export interface AnchorContext {
  activeLink: Readonly<Ref<string>>;
  registerLink(item: AnchorItem): void;
  updateLink(element: HTMLElement, href: string, title: string): void;
  unregisterLink(element: HTMLElement): void;
  handleClick(item: AnchorItem): void;
}

/** 使用符号注入键避免与宿主应用的字符串 provide 冲突。 */
export const ANCHOR_INJECTION_KEY: InjectionKey<AnchorContext> = Symbol('exui-anchor');
