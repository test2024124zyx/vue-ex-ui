import ExStepsComponent from './ExSteps.vue';
import ExStepComponent from './ExStep.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExStepsProps, ExStepsEmits, ExStepsExposed } from './types';
import type { ExStepProps, ExStepExposed } from './types';

// 导出组件类型
export type { ExStepsProps, ExStepsEmits, ExStepsExposed };
export type { ExStepProps, ExStepExposed };
export type { StepStatus, StepsDirection, StepsSize, StepsContext } from './types';

// 导出组件
export const ExStep: InstallableComponent<typeof ExStepComponent> = withInstall(ExStepComponent);
export const ExSteps: InstallableComponent<typeof ExStepsComponent> = withInstall(
  ExStepsComponent,
  { ExStep }
);

export default ExSteps;
