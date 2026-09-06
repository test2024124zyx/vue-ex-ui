import ExSelectComponent from './ExSelect.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type {
  ExSelectProps,
  ExSelectEmits,
  ExSelectExposed,
  ExSelectSlots,
  SelectOption,
  SelectOptionGroup,
  SelectOptions,
  SelectSize,
} from './types';

// 导出组件
export const ExSelect: InstallableComponent<typeof ExSelectComponent> =
  withInstall(ExSelectComponent);

export default ExSelect;
