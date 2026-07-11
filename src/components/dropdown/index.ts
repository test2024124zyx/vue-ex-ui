import ExDropdownComponent from './ExDropdown.vue';
import ExDropdownItemComponent from './ExDropdownItem.vue';
import { withInstall } from '../../utils/install';

export const ExDropdownItem = withInstall(ExDropdownItemComponent);
export const ExDropdown = withInstall(ExDropdownComponent, { Item: ExDropdownItem });

export * from './types';
export default ExDropdown;
