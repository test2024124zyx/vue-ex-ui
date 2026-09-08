export type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TagSize = 'large' | 'medium' | 'small';
export type TagEffect = 'dark' | 'light' | 'plain';

export interface TagProps {
  type?: TagType;
  closable?: boolean;
  /** 是否将标签作为可键盘操作的交互控件。 */
  clickable?: boolean;
  /** 交互标签缺少可见文本时的无障碍名称。 */
  ariaLabel?: string;
  /** 关闭按钮的无障碍名称。 */
  closeAriaLabel?: string;
  round?: boolean;
  size?: TagSize;
  effect?: TagEffect;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

export interface ExTagInputProps {
  /** 禁用时禁止开始编辑或提交，继承 Form 的禁用状态。 */
  disabled?: boolean;
  /** 只读时禁止新增标签，继承 Form 的只读状态。 */
  readonly?: boolean;
  /** 当前可见字段控件的 ID。 */
  id?: string;
  /** 字段的显式可访问名称。 */
  ariaLabel?: string;
  /** 字段名称元素的 ID。 */
  ariaLabelledby?: string;
  /** 附加描述元素的 ID。 */
  ariaDescribedby?: string;
  /** 按钮文本 */
  buttonText?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 尺寸 */
  size?: TagSize;
  /** 最大长度 */
  maxlength?: number;
  /** 已存在的标签列表，用于验证重复 */
  existingTags?: string[];
  /** 是否验证重复 */
  validateDuplicate?: boolean;
}

export interface ExTagInputEmits {
  /** 确认添加标签 */
  (e: 'confirm', value: string): void;
  /** 取消添加 */
  (e: 'cancel'): void;
  /** 标签重复 */
  (e: 'duplicate', value: string): void;
}
