import ExEmptyComponent from './ExEmpty.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExEmpty: InstallableComponent<typeof ExEmptyComponent> = withInstall(ExEmptyComponent);

export * from './types';
export default ExEmpty;
