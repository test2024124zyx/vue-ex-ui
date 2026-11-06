/**
 * 验证码输入组件类型定义
 * ExVerificationCode - 专业的 OTP/验证码输入组件
 */

/**
 * 输入模式类型
 * - numeric: 仅数字
 * - alphanumeric: 字母和数字
 */
export type VerificationCodeInputMode = 'numeric' | 'alphanumeric';

/**
 * 组件尺寸类型
 */
export type VerificationCodeSize = 'small' | 'medium' | 'large';

/**
 * 样式变体类型
 * - neon: 霓虹发光效果（默认）
 * - ghost: 幽灵透明效果
 * - filled: 填充实心效果
 */
export type VerificationCodeVariant = 'neon' | 'ghost' | 'filled';

/**
 * 组件状态类型
 */
export type VerificationCodeStatus = 'default' | 'success' | 'warning' | 'error';

/**
 * 验证码输入组件属性接口
 */
export interface ExVerificationCodeProps {
  /** 绑定值 */
  modelValue?: string;
  /** 验证码长度（格子数量），默认 6 */
  length?: number;
  /** 输入模式：numeric 仅数字，alphanumeric 字母数字 */
  inputMode?: VerificationCodeInputMode;
  /** 组件尺寸 */
  size?: VerificationCodeSize;
  /** 样式变体 */
  variant?: VerificationCodeVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 状态 */
  status?: VerificationCodeStatus;
  /** 是否启用密码遮罩 */
  mask?: boolean;
  /** 是否显示遮罩切换按钮 */
  showMaskToggle?: boolean;
  /** 遮罩前显示字符的延迟（毫秒），默认 300 */
  maskDelay?: number;
  /** 是否自动提交 */
  autoSubmit?: boolean;
  /** 自动提交延迟（毫秒），默认 500 */
  autoSubmitDelay?: number;
  /** 是否自动聚焦 */
  autofocus?: boolean;
  /** 分隔符位置（如 [3] 表示在第3个格子后显示分隔符） */
  separatorPositions?: number[];
  /** 分隔符字符，默认 '-' */
  separator?: string;
  /** 占位符字符 */
  placeholder?: string;
  /** 标签文本 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 帮助文本 */
  helpText?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 自定义格子宽度 */
  cellWidth?: string | number;
  /** 格子间距 */
  cellGap?: string | number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: Record<string, string>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 验证码输入组件事件接口
 */
export interface ExVerificationCodeEmits {
  /** 值变化事件 */
  'update:modelValue': [value: string];
  /** 输入事件 */
  input: [value: string];
  /** 变化事件 */
  change: [value: string];
  /** 完成事件（所有格子填满） */
  complete: [value: string];
  /** 提交事件（自动提交或手动触发） */
  submit: [value: string];
  /** 聚焦事件 */
  focus: [event: FocusEvent, index: number];
  /** 失焦事件 */
  blur: [event: FocusEvent];
  /** 清空事件 */
  clear: [];
}

/**
 * 验证码输入组件暴露的方法接口
 */
export interface ExVerificationCodeExposed {
  /** 聚焦到第一个空格子 */
  focus: () => void;
  /** 失焦 */
  blur: () => void;
  /** 清空所有格子 */
  clear: () => void;
  /** 设置值 */
  setValue: (value: string) => void;
  /** 获取当前值 */
  getValue: () => string;
  /** 获取容器元素 */
  getElement: () => HTMLDivElement | null;
  /** 手动触发提交 */
  submit: () => void;
}

/**
 * 内部状态接口
 */
export interface VerificationCodeInternalState {
  /** 各格子的值数组 */
  cells: string[];
  /** 当前聚焦的格子索引 */
  focusedIndex: number;
  /** 是否处于聚焦状态 */
  isFocused: boolean;
  /** 是否显示遮罩 */
  isMasked: boolean;
  /** 自动提交定时器 */
  autoSubmitTimer: ReturnType<typeof setTimeout> | null;
  /** 最近输入的格子索引（用于遮罩延迟） */
  lastInputIndex: number;
  /** 遮罩延迟定时器 */
  maskDelayTimer: ReturnType<typeof setTimeout> | null;
  /** 是否正在等待自动提交 */
  isPendingSubmit: boolean;
}

/**
 * 验证字符是否有效
 * @param char 要验证的字符
 * @param mode 输入模式
 * @returns 是否有效
 */
export function isValidChar(char: string, mode: VerificationCodeInputMode): boolean {
  if (mode === 'numeric') {
    return /^[0-9]$/.test(char);
  }
  return /^[a-zA-Z0-9]$/.test(char);
}

/**
 * 过滤字符串中的有效字符
 * @param str 要过滤的字符串
 * @param mode 输入模式
 * @returns 过滤后的字符串
 */
export function filterValidChars(str: string, mode: VerificationCodeInputMode): string {
  return str
    .split('')
    .filter(char => isValidChar(char, mode))
    .join('');
}
