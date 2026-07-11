import ExFilePreviewComponent from './ExFilePreview.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExFilePreview: InstallableComponent<typeof ExFilePreviewComponent> =
  withInstall(ExFilePreviewComponent);

export * from './errors';
export * from './preview-utils';
export * from './types';
export default ExFilePreview;
