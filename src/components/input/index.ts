import ExInputComponent from './ExInput.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type {
  ExInputExposed,
  ExInputEmits,
  ExInputProps,
  ExInputSlots,
  InputAutosize,
  InputModelModifiers,
  InputModelValue,
  InputSize,
  InputStatus,
  InputType,
  InputVariant,
  InputValidateTrigger,
  ValidationResult,
  ValidationRule,
} from './types';

export const ExInput: InstallableComponent<typeof ExInputComponent> = withInstall(ExInputComponent);

export default ExInput;
