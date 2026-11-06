import ExListComponent from './ExList.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type {
  ExListEmits,
  ExListExposed,
  ExListProps,
  ExListSlots,
  ListGrid,
  ListItem,
  ListItemKey,
  ListItemKeyResolver,
  ListSize,
  ListSlotProps,
} from './types';

export const ExList: InstallableComponent<typeof ExListComponent> = withInstall(ExListComponent);

export default ExList;
