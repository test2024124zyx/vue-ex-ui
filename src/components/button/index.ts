import ExButtonComponent from './ExButton.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExButtonProps, ExButtonEmits, ExButtonExposed } from './types';

// 导出组件类型
export type { ExButtonProps, ExButtonEmits, ExButtonExposed };
export type { ButtonType, ButtonSize, ButtonShape, NativeButtonType } from './types';

export const ExButton: InstallableComponent<typeof ExButtonComponent> =
  withInstall(ExButtonComponent);

export default ExButton;
