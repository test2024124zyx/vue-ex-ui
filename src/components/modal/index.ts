import ExModalComponent from './ExModal.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExModal: InstallableComponent<typeof ExModalComponent> = withInstall(ExModalComponent);

export * from './types';
export default ExModal;
