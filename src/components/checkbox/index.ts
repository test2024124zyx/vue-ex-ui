import ExCheckboxComponent from './ExCheckbox.vue';
import ExCheckboxGroupComponent from './ExCheckboxGroup.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExCheckboxProps,
  ExCheckboxEmits,
  ExCheckboxSlots,
  ExCheckboxInstance,
  ExCheckboxGroupProps,
  ExCheckboxGroupEmits,
  ExCheckboxGroupSlots,
  ExCheckboxGroupInstance,
  CheckboxValue,
  CheckboxSize,
  CheckboxShape,
  CheckboxStatus,
  CheckboxOption,
} from './types';

export const ExCheckboxGroup: InstallableComponent<typeof ExCheckboxGroupComponent> =
  withInstall(ExCheckboxGroupComponent);
export const ExCheckbox: InstallableComponent<typeof ExCheckboxComponent> = withInstall(
  ExCheckboxComponent,
  { ExCheckboxGroup }
);

// 导出类型
export type {
  ExCheckboxProps,
  ExCheckboxEmits,
  ExCheckboxSlots,
  ExCheckboxInstance,
  ExCheckboxGroupProps,
  ExCheckboxGroupEmits,
  ExCheckboxGroupSlots,
  ExCheckboxGroupInstance,
  CheckboxValue,
  CheckboxSize,
  CheckboxShape,
  CheckboxStatus,
  CheckboxOption,
};

export default ExCheckbox;
