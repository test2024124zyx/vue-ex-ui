import ExBackTopComponent from './ExBackTop.vue';
import { withInstall } from '../../utils/install';
import type { InstallableComponent } from '../../utils/install';

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

export const ExBackTop: InstallableComponent<typeof ExBackTopComponent> =
  withInstall(ExBackTopComponent);

export default ExBackTop;
