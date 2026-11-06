import ExFileUploadComponent from './ExFileUpload.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExFileUpload: InstallableComponent<typeof ExFileUploadComponent> =
  withInstall(ExFileUploadComponent);

export * from './errors';
export * from './types';
export * from './upload-utils';
export default ExFileUpload;
