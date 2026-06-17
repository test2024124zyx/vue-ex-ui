import type { App } from 'vue';
import ExRate from './ExRate.vue';
import type {
  ExRateProps,
  ExRateEmits,
  ExRateInstance,
  RateSize,
} from './types';

import './ExRate.scss';

// 为组件提供 install 方法，用于全局注册
ExRate.install = (app: App): void => {
  app.component(ExRate.name || 'ExRate', ExRate);
};

// 导出组件
export { ExRate };

// 导出类型
export type {
  ExRateProps,
  ExRateEmits,
  ExRateInstance,
  RateSize,
};

export default ExRate;
