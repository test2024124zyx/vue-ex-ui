import ExTooltipComponent from './ExTooltip.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExTooltipProps,
  ExTooltipEmits,
  ExTooltipExposed,
  TooltipPlacement,
  TooltipTrigger,
  TooltipEffect,
} from './types';

// 导出组件类型
export type {
  ExTooltipProps,
  ExTooltipEmits,
  ExTooltipExposed,
  TooltipPlacement,
  TooltipTrigger,
  TooltipEffect,
};

// 导出组件
export const ExTooltip: InstallableComponent<typeof ExTooltipComponent> =
  withInstall(ExTooltipComponent);

export default ExTooltip;
