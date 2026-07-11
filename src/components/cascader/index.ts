import ExCascaderComponent from './ExCascader.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExCascader: InstallableComponent<typeof ExCascaderComponent> =
  withInstall(ExCascaderComponent);

export default ExCascader;
export type * from './types';
