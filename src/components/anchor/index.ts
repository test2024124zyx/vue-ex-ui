import ExAnchorComponent from './ExAnchor.vue';
import ExAnchorLink from './ExAnchorLink.vue';
import { withInstall } from '../../utils/install';
import type { InstallableComponent } from '../../utils/install';

export const ExAnchor: InstallableComponent<typeof ExAnchorComponent> & {
  Link: typeof ExAnchorLink;
} = withInstall(ExAnchorComponent, { Link: ExAnchorLink });

export default ExAnchor;
export { ExAnchorLink };
export * from './types';
