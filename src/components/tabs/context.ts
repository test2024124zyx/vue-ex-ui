import type { ComputedRef } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

export interface PaneInfo {
  name: string | number;
  label?: string;
  disabled?: boolean;
  closable?: boolean;
}

interface TabsContext {
  activeTab: ComputedRef<PaneInfo['name'] | undefined>;
  getTabId: (name: PaneInfo['name']) => string;
  getPanelId: (name: PaneInfo['name']) => string;
  registerPane: (pane: PaneInfo) => void;
  updatePane: (registeredName: PaneInfo['name'], pane: PaneInfo) => void;
  unregisterPane: (name: PaneInfo['name']) => void;
}

export const tabsContextKey = createSharedInjectionKey<TabsContext>('tabs');
