import ExFileDownloadComponent from './ExFileDownload.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExFileDownload: InstallableComponent<typeof ExFileDownloadComponent> =
  withInstall(ExFileDownloadComponent);

export * from './download-utils';
export * from './errors';
export * from './types';
export default ExFileDownload;
