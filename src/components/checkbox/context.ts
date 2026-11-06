import type { ComputedRef, InjectionKey } from 'vue';
import type { CheckboxShape, CheckboxSize, CheckboxStatus } from './types';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

export interface CheckboxRegistration {
  getValue: () => string | number | undefined;
  isDisabled: () => boolean;
}

export interface CheckboxGroupContext {
  modelValue: ComputedRef<Array<string | number>>;
  name: ComputedRef<string | undefined>;
  size: ComputedRef<CheckboxSize>;
  shape: ComputedRef<CheckboxShape>;
  status: ComputedRef<CheckboxStatus>;
  disabled: ComputedRef<boolean>;
  readonly: ComputedRef<boolean>;
  updateValue: (value: string | number, checked: boolean) => boolean;
  registerCheckbox: (uid: number, registration: CheckboxRegistration) => void;
  unregisterCheckbox: (uid: number) => void;
}

/** 复选框组使用符号上下文，避免与第三方组件的字符串键冲突。 */
export const checkboxGroupContextKey: InjectionKey<CheckboxGroupContext> =
  createSharedInjectionKey('checkbox-group');
