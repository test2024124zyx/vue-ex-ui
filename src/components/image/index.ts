import ExImageComponent from './ExImage.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExImage: InstallableComponent<typeof ExImageComponent> = withInstall(ExImageComponent);
export type { ExImageProps, ExImageEmits } from './types';

export default ExImage;
