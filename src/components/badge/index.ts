import type { App } from 'vue';
import ExBadge from './ExBadge.vue';
import type { ExBadgeProps, ExBadgeEmits, ExBadgeExposed } from './types';

// 导出组件类型
export type { ExBadgeProps, ExBadgeEmits, ExBadgeExposed };
export type { BadgeType, BadgeSize, BadgeStatus, BadgePosition } from './types';

// 导出组件
export { ExBadge };

// 组件安装插件
export const ExBadgePlugin = {
  install(app: App) {
    app.component('ExBadge', ExBadge);
  },
};

export default ExBadgePlugin;
