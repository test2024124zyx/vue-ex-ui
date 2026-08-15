import ExAnchorComponent from './ExAnchor.vue';
import ExAnchorLinkComponent from './ExAnchorLink.vue';
import { withInstall } from '../../utils/install';
import type { InstallableComponent } from '../../utils/install';

export const ExAnchorLink: InstallableComponent<typeof ExAnchorLinkComponent> =
  withInstall(ExAnchorLinkComponent);

export const ExAnchor: InstallableComponent<typeof ExAnchorComponent> & {
  Link: typeof ExAnchorLink;
} = withInstall(ExAnchorComponent, { Link: ExAnchorLink });

export default ExAnchor;
export * from './types';
