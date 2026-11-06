import ExDateTimePickerComponent from './ExDateTimePicker.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExDateTimePicker: InstallableComponent<typeof ExDateTimePickerComponent> =
  withInstall(ExDateTimePickerComponent);

export default ExDateTimePicker;
export type * from './types';
