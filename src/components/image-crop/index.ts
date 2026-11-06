import ExImageCropComponent from './ExImageCrop.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExImageCrop: InstallableComponent<typeof ExImageCropComponent> =
  withInstall(ExImageCropComponent);

export { ExImageCropError } from './errors';
export type { ImageCropErrorCode } from './errors';
export default ExImageCrop;
export * from './types';
