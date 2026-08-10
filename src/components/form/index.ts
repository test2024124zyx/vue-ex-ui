import type { App } from 'vue';
import ExForm from './ExForm.vue';
import ExFormItem from './ExFormItem.vue';
import type {
  ExFormProps,
  ExFormItemProps,
  FormRule,
  FormSize,
  FormLayout,
  FormLabelAlign,
  FormLabelPlacement,
  FormValidateStatus,
  FormValidateResult,
  FormValidateError,
  FormItemValidateResult,
  FormInstance,
  FormItemInstance,
} from './types';
import { commonRules, validateUtils } from './utils';

// 为组件提供 install 方法，用于全局注册
ExForm.install = (app: App): void => {
  app.component(ExForm.name || 'ExForm', ExForm);
};

ExFormItem.install = (app: App): void => {
  app.component(ExFormItem.name || 'ExFormItem', ExFormItem);
};

// 插件导出
export const ExFormPlugin = {
  install(app: App): void {
    app.component(ExForm.name || 'ExForm', ExForm);
    app.component(ExFormItem.name || 'ExFormItem', ExFormItem);
  },
};

export { ExForm, ExFormItem, commonRules, validateUtils };
export type {
  ExFormProps,
  ExFormItemProps,
  FormRule,
  FormSize,
  FormLayout,
  FormLabelAlign,
  FormLabelPlacement,
  FormValidateStatus,
  FormValidateResult,
  FormValidateError,
  FormItemValidateResult,
  FormInstance,
  FormItemInstance,
};

export default ExForm;
