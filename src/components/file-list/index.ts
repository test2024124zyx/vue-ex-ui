import ExFileListComponent from './ExFileList.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExFileList: InstallableComponent<typeof ExFileListComponent> =
  withInstall(ExFileListComponent);

export * from './file-list-utils';
export * from './types';
export default ExFileList;
