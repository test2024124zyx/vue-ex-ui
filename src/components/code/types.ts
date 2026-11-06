import type { CSSProperties } from 'vue';

/** 内置语法高亮语言。 */
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'vue'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'bash'
  | 'shell'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'sql'
  | 'markdown'
  | 'yaml'
  | 'xml'
  | 'plaintext';

/** 代码块视觉主题。 */
export type CodeTheme = 'dark' | 'light' | 'neon';

/** 代码组件属性。 */
export interface ExCodeProps {
  /** 展示或编辑的代码内容；传入时严格受控，未传时内部维护空字符串初始值。 */
  code?: string;
  /** 语法高亮语言。 */
  language?: CodeLanguage;
  /** 代码块视觉主题。 */
  theme?: CodeTheme;
  /** 是否显示行号。 */
  lineNumbers?: boolean;
  /** 高亮行号，支持数组或 `1,3-5` 格式。 */
  highlightLines?: string | readonly number[];
  /** 第一行显示的行号。 */
  startLine?: number;
  /** 是否展示复制按钮。 */
  copyable?: boolean;
  /** 是否展示语言标签。 */
  showLanguage?: boolean;
  /** 可选文件名。 */
  filename?: string;
  /** 内容区最大高度。 */
  maxHeight?: string | number;
  /** 是否自动换行。 */
  wrap?: boolean;
  /** 是否启用原位编辑。 */
  editable?: boolean;
  /** 编辑模式是否只读。 */
  readonly?: boolean;
  /** Tab 插入空格数及制表符显示宽度，范围为 1～16。 */
  tabSize?: number;
  /** 根元素自定义类名。 */
  class?: string | string[] | Record<string, boolean>;
  /** 根元素自定义样式。 */
  style?: string | CSSProperties;
}

/** 代码组件事件。 */
export interface ExCodeEmits {
  /** 复制成功，参数为实际写入剪贴板的代码快照。 */
  copy: [code: string];
  /** 剪贴板写入失败。 */
  'copy-error': [error: Error];
  /** 请求更新编辑内容，受控模式等待父级回写后生效。 */
  'update:code': [code: string];
  /** 编辑内容发生变化。 */
  change: [code: string];
}

/** 代码组件公开方法。 */
export interface ExCodeExposed {
  /** 获取当前代码内容。 */
  getCode: () => string;
  /** 复制当前代码并返回是否成功。 */
  copy: () => Promise<boolean>;
  /** 获取根元素。 */
  getElement: () => HTMLDivElement | null;
}
