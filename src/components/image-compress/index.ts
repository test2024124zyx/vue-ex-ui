import ExImageCompressComponent from './ExImageCompress.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExImageCompress: InstallableComponent<typeof ExImageCompressComponent> =
  withInstall(ExImageCompressComponent);

export default ExImageCompress;
export * from './types';
export { ExImageCompressError } from './errors';
export type { ImageCompressErrorCode } from './errors';
export { compressImage, compressImages, downloadCompressedImage, formatBytes } from './utils';
