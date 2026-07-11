import ExInputComponent from './ExInput.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type {
  ExInputProps,
  ExInputEmits,
  ExInputSlots,
  ExInputInstance,
  InputType,
  InputSize,
  InputStatus,
  InputVariant,
} from './types';

// 导出组件
export const ExInput: InstallableComponent<typeof ExInputComponent> = withInstall(ExInputComponent);

export default ExInput;
