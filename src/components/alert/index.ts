import ExAlertComponent from './ExAlert.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExAlertProps,
  ExAlertEmits,
  ExAlertSlots,
  ExAlertInstance,
  AlertType,
  AlertSize,
  AlertVariant,
} from './types';

export const ExAlert: InstallableComponent<typeof ExAlertComponent> = withInstall(ExAlertComponent);

// 导出类型
export type {
  ExAlertProps,
  ExAlertEmits,
  ExAlertSlots,
  ExAlertInstance,
  AlertType,
  AlertSize,
  AlertVariant,
};

export default ExAlert;
