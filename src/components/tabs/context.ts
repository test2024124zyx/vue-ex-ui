import type { ComponentInternalInstance, ComputedRef } from 'vue';
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
  isPaneVisible: (instance: ComponentInternalInstance, name: PaneInfo['name']) => boolean;
  registerPane: (instance: ComponentInternalInstance, pane: PaneInfo) => void;
  updatePane: (
    instance: ComponentInternalInstance,
    previousName: PaneInfo['name'],
    pane: PaneInfo
  ) => void;
  unregisterPane: (uid: number) => void;
}

export const tabsContextKey = createSharedInjectionKey<TabsContext>('tabs');
