import type { ComputedRef } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';
import type { FormValidateStatus } from '../form/types';
import type { RadioSize, RadioStatus, RadioValue } from './types';

interface RadioGroupContext {
  modelValue: ComputedRef<RadioValue | undefined>;
  name: string;
  size: ComputedRef<RadioSize>;
  status: RadioStatus | FormValidateStatus;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  updateValue: (value: RadioValue) => void;
  registerRadio: (restore: () => void) => () => void;
}

export const radioGroupContextKey = createSharedInjectionKey<RadioGroupContext>('radio-group');
