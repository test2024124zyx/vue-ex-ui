import type { App } from 'vue';
import ExSteps from './ExSteps.vue';
import ExStep from './ExStep.vue';
import type { ExStepsProps, ExStepsEmits, ExStepsExposed } from './types';
import type { ExStepProps, ExStepExposed } from './types';

// 导出组件类型
export type { ExStepsProps, ExStepsEmits, ExStepsExposed };
export type { ExStepProps, ExStepExposed };
export type { StepStatus, StepsDirection, StepsSize, StepsContext } from './types';

// 导出组件
export { ExSteps, ExStep };

// 组件安装插件
export const StepsPlugin = {
  install(app: App) {
    app.component('ExSteps', ExSteps);
    app.component('ExStep', ExStep);
  },
};

export default StepsPlugin;
