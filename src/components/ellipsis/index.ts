import ExEllipsisComponent from './ExEllipsis.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExEllipsis: InstallableComponent<typeof ExEllipsisComponent> =
  withInstall(ExEllipsisComponent);
export type { ExEllipsisProps } from './types';

export default ExEllipsis;
