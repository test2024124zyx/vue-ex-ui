import ExTagComponent from './ExTag.vue';
import ExTagInputComponent from './ExTagInput.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExTagInput: InstallableComponent<typeof ExTagInputComponent> =
  withInstall(ExTagInputComponent);
export const ExTag: InstallableComponent<typeof ExTagComponent> = withInstall(ExTagComponent, {
  ExTagInput,
});

export default ExTag;
