import ExIconComponent from './ExIcon.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type { ExIconProps, ExIconEmits, IconSize } from './types';
export type { BuiltinIconName } from './icons';
export { ICONS, getBuiltinIcon, isBuiltinIcon } from './icons';

export const ExIcon: InstallableComponent<typeof ExIconComponent> = withInstall(ExIconComponent);

export default ExIcon;
