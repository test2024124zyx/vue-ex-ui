import ExVerificationCodeComponent from './ExVerificationCode.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type {
  ExVerificationCodeProps,
  ExVerificationCodeEmits,
  ExVerificationCodeExposed,
  VerificationCodeInputMode,
  VerificationCodeSize,
  VerificationCodeVariant,
  VerificationCodeStatus,
  VerificationCodeInternalState,
} from './types';

// 导出工具函数
export { isValidChar, filterValidChars } from './types';

// 导出组件
export const ExVerificationCode: InstallableComponent<typeof ExVerificationCodeComponent> =
  withInstall(ExVerificationCodeComponent);

export default ExVerificationCode;
