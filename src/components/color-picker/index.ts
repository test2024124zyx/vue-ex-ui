import ExColorPickerComponent from './ExColorPicker.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExColorPicker: InstallableComponent<typeof ExColorPickerComponent> =
  withInstall(ExColorPickerComponent);

export default ExColorPicker;
export type * from './types';
