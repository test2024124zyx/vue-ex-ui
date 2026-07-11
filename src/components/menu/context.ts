import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { MenuMode, MenuSelectInfo } from './types';

export interface MenuContext {
  mode: ComputedRef<MenuMode>;
  collapsed: ComputedRef<boolean>;
  activeKey: ComputedRef<string>;
  openKeys: ComputedRef<readonly string[]>;
  tabStopKey: Readonly<Ref<string | null>>;
  registerFocusable: (key: string, disabled: Readonly<Ref<boolean>>) => () => void;
  getTabIndex: (key: string, disabled: boolean) => 0 | -1;
  setTabStop: (key: string) => void;
  handleItemClick: (key: string, event: MouseEvent) => MenuSelectInfo;
  handleOpenChange: (key: string, open: boolean) => void;
}

export const MENU_INJECTION_KEY: InjectionKey<MenuContext> = Symbol('ExMenu');
