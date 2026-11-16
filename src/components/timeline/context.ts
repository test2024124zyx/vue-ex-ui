import type { ComputedRef } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';
import type { TimelineDirection, TimelineMode } from './types';

interface TimelineContext {
  direction: ComputedRef<TimelineDirection>;
  mode: ComputedRef<TimelineMode>;
  showLine: ComputedRef<boolean>;
}

export const timelineContextKey = createSharedInjectionKey<TimelineContext>('timeline');
