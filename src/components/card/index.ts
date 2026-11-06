import ExCardComponent from './ExCard.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type { ExCardProps, ExCardEmits, ExCardExposed } from './types';
export type { CardType, CardSize, CardShadow } from './types';

export const ExCard: InstallableComponent<typeof ExCardComponent> = withInstall(ExCardComponent);

export default ExCard;
