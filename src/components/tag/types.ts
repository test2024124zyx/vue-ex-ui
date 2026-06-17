export type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TagSize = 'large' | 'medium' | 'small';
export type TagEffect = 'dark' | 'light' | 'plain';

export interface TagProps {
	type?: TagType;
	closable?: boolean;
	round?: boolean;
	size?: TagSize;
	effect?: TagEffect;
	color?: string;
	bgColor?: string;
	borderColor?: string;
}

export interface ExTagInputProps {
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