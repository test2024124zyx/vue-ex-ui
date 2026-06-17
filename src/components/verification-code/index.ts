import type { App } from 'vue';
import ExVerificationCode from './ExVerificationCode.vue';

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
export { ExVerificationCode };

// 组件安装插件
export const ExVerificationCodePlugin = {
  install(app: App) {
    app.component('ExVerificationCode', ExVerificationCode);
  },
};

export default ExVerificationCodePlugin;
