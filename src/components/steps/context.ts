import { createSharedInjectionKey } from '../../utils/shared-runtime';
import type { StepsContext } from './types';

export const stepsContextKey = createSharedInjectionKey<StepsContext>('steps');
