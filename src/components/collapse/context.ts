import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { CollapseItemName } from './types';

export interface CollapseContext {
  activeNames: Ref<CollapseItemName[]>;
  disabled: ComputedRef<boolean>;
  expandIconPosition: ComputedRef<'left' | 'right'>;
  isActive: (name: CollapseItemName) => boolean;
  handleItemClick: (name: CollapseItemName) => void;
  registerItem: (name: CollapseItemName, uid: number) => void;
  unregisterItem: (name: CollapseItemName, uid: number) => void;
}

/** 折叠面板上下文使用符号键，避免字符串注入冲突。 */
export const collapseContextKey: InjectionKey<CollapseContext> = Symbol('ex-collapse');
