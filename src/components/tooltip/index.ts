import type { App } from 'vue';
import ExTooltip from './ExTooltip.vue';
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
export { ExTooltip };

// 组件安装插件
export const ExTooltipPlugin = {
  install(app: App) {
    app.component('ExTooltip', ExTooltip);
  },
};

export default ExTooltipPlugin;
