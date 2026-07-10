import type { App } from 'vue';
import ExBackTop from './ExBackTop.vue';

// 导出组件类型
export type {
  ExBackTopProps,
  ExBackTopEmits,
  ExBackTopExposed,
  BackTopPosition,
  BackTopShape,
  BackTopSize,
  BackTopAnimation,
  BackTopScrollBehavior,
  BackTopProgressType,
  BackTopTarget,
  BackTopOffset,
  BackTopScrollInfo,
} from './types';

// 组件安装函数
ExBackTop.install = (app: App): void => {
  app.component('ExBackTop', ExBackTop);
};

export { ExBackTop };
export default ExBackTop;
