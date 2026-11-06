import ExDropdownComponent from './ExDropdown.vue';
import ExDropdownItemComponent from './ExDropdownItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExDropdownItem: InstallableComponent<typeof ExDropdownItemComponent> =
  withInstall(ExDropdownItemComponent);
export const ExDropdown: InstallableComponent<typeof ExDropdownComponent> & {
  Item: typeof ExDropdownItem;
} = withInstall(ExDropdownComponent, { Item: ExDropdownItem });

export * from './types';
export default ExDropdown;
