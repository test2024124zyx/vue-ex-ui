import type { InjectionKey, Ref } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

/** DropdownItem 与最近一层 Dropdown 共享的最小交互上下文。 */
export interface DropdownContext {
  activeItemId: Readonly<Ref<string | null>>;
  activate: (itemId: string) => void;
  select: () => void;
}

export const DROPDOWN_INJECTION_KEY: InjectionKey<DropdownContext> =
  createSharedInjectionKey('dropdown');
