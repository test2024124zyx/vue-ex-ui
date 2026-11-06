import ExAffixComponent from './ExAffix.vue';
import { withInstall } from '../../utils/install';
import type { InstallableComponent } from '../../utils/install';

export const ExAffix: InstallableComponent<typeof ExAffixComponent> = withInstall(ExAffixComponent);

export default ExAffix;
export * from './types';
