import ExDialogComponent from './ExDialog.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExDialog: InstallableComponent<typeof ExDialogComponent> =
  withInstall(ExDialogComponent);

export default ExDialog;
export type * from './types';
