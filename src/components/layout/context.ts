import type { InjectionKey } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

export interface LayoutContext {
  /** 注册直系侧栏并返回幂等注销函数。 */
  registerSider: () => () => void;
}

/** 每层 Layout 独立维护自己的直系侧栏数量。 */
export const layoutContextKey: InjectionKey<LayoutContext> = createSharedInjectionKey('layout');
