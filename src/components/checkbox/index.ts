import type { App } from 'vue';
import ExCheckbox from './ExCheckbox.vue';
import ExCheckboxGroup from './ExCheckboxGroup.vue';
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
  CheckboxStatus,
  CheckboxOption,
} from './types';

// 导出组件
export { ExCheckbox, ExCheckboxGroup };

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
  CheckboxStatus,
  CheckboxOption,
};

// 导出安装函数
const ExCheckboxPlugin = {
  install(app: App) {
    app.component('ExCheckbox', ExCheckbox);
    app.component('ExCheckboxGroup', ExCheckboxGroup);
  },
};

export { ExCheckboxPlugin };
export default ExCheckboxPlugin;
