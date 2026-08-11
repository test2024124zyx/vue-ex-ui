import ExWatermarkComponent from './ExWatermark.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExWatermark: InstallableComponent<typeof ExWatermarkComponent> =
  withInstall(ExWatermarkComponent);
export type * from './types';

export default ExWatermark;
