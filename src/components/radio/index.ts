import ExRadioComponent from './ExRadio.vue';
import ExRadioGroupComponent from './ExRadioGroup.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExRadioProps,
  ExRadioEmits,
  ExRadioSlots,
  ExRadioInstance,
  ExRadioGroupProps,
  ExRadioGroupEmits,
  ExRadioGroupSlots,
  ExRadioGroupInstance,
  RadioValue,
  RadioSize,
  RadioStatus,
} from './types';

// 导出组件
export const ExRadioGroup: InstallableComponent<typeof ExRadioGroupComponent> =
  withInstall(ExRadioGroupComponent);
export const ExRadio: InstallableComponent<typeof ExRadioComponent> = withInstall(
  ExRadioComponent,
  { ExRadioGroup }
);

// 导出类型
export type {
  ExRadioProps,
  ExRadioEmits,
  ExRadioSlots,
  ExRadioInstance,
  ExRadioGroupProps,
  ExRadioGroupEmits,
  ExRadioGroupSlots,
  ExRadioGroupInstance,
  RadioValue,
  RadioSize,
  RadioStatus,
};

export default ExRadio;
