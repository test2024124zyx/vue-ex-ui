import ExDateTimePickerComponent from './ExDateTimePicker.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExDateTimePickerProps,
  ExDateTimePickerEmits,
  ExDateTimePickerExposed,
} from './types';

// 导出组件类型
export type { ExDateTimePickerProps, ExDateTimePickerEmits, ExDateTimePickerExposed };
export type { DateTimePickerType, DateTimePickerSize, DateFormat, DisabledDateFn } from './types';

export const ExDateTimePicker: InstallableComponent<typeof ExDateTimePickerComponent> =
  withInstall(ExDateTimePickerComponent);

export default ExDateTimePicker;
