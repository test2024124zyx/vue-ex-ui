import ExInputComponent from './ExInput.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type {
  ExInputExposed,
  ExInputEmits,
  ExInputProps,
  ExInputSlots,
  InputAutosize,
  InputModelValue,
  InputSize,
  InputStatus,
  InputType,
  InputVariant,
  ValidationResult,
  ValidationRule,
} from './types';

export const ExInput: InstallableComponent<typeof ExInputComponent> = withInstall(ExInputComponent);

export default ExInput;
