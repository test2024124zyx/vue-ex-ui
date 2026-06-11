import type { App } from 'vue';
import ExRadio from './ExRadio.vue';
import ExRadioGroup from './ExRadioGroup.vue';
import type {
  ExRadioProps,
  ExRadioEmits,
  ExRadioSlots,
  ExRadioInstance,
  ExRadioGroupProps,
  ExRadioGroupEmits,
  ExRadioGroupSlots,
  ExRadioGroupInstance,
  RadioValue,
  RadioSize,
  RadioStatus,
} from './types';

// 导出组件
export { ExRadio, ExRadioGroup };

// 导出类型
export type {
  ExRadioProps,
  ExRadioEmits,
  ExRadioSlots,
  ExRadioInstance,
  ExRadioGroupProps,
  ExRadioGroupEmits,
  ExRadioGroupSlots,
  ExRadioGroupInstance,
  RadioValue,
  RadioSize,
  RadioStatus,
};

// 导出安装函数
const ExRadioPlugin = {
  install(app: App) {
    app.component('ExRadio', ExRadio);
    app.component('ExRadioGroup', ExRadioGroup);
  },
};

export { ExRadioPlugin };
export default ExRadioPlugin;
