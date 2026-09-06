import type { ComputedRef, InjectionKey } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

/** 同一棵树共享状态索引，递归节点无需反复扫描公开的有序键数组。 */
export interface TreeStateLookup {
  expanded: ComputedRef<ReadonlySet<string>>;
  selected: ComputedRef<ReadonlySet<string>>;
  checked: ComputedRef<ReadonlySet<string>>;
  halfChecked: ComputedRef<ReadonlySet<string>>;
}

export const TREE_STATE_KEY: InjectionKey<TreeStateLookup> = createSharedInjectionKey('tree-state');
