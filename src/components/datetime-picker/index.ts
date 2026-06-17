import type { App } from 'vue';
import ExDateTimePicker from './ExDateTimePicker.vue';
import type { ExDateTimePickerProps, ExDateTimePickerEmits, ExDateTimePickerExposed } from './types';

// 导出组件类型
export type { ExDateTimePickerProps, ExDateTimePickerEmits, ExDateTimePickerExposed };
export type { DateTimePickerType, DateTimePickerSize, DateFormat, DisabledDateFn } from './types';

// 导出组件
export { ExDateTimePicker };

// 组件安装插件
export const ExDateTimePickerPlugin = {
  install(app: App) {
    app.component('ExDateTimePicker', ExDateTimePicker);
  },
};

export default ExDateTimePickerPlugin;
