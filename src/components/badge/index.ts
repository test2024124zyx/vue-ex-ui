import ExBadgeComponent from './ExBadge.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExBadgeProps, ExBadgeEmits, ExBadgeExposed } from './types';

// 导出组件类型
export type { ExBadgeProps, ExBadgeEmits, ExBadgeExposed };
export type { BadgeType, BadgeSize, BadgeStatus, BadgePosition } from './types';

export const ExBadge: InstallableComponent<typeof ExBadgeComponent> = withInstall(ExBadgeComponent);

export default ExBadge;
