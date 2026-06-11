/**
 * 代码语言类型
 */
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

/**
 * 代码主题类型
 */
export type CodeTheme = 'dark' | 'light' | 'neon';

/**
 * 代码组件属性接口
 */
export interface ExCodeProps {
  /** 代码内容 */
  code?: string;
  /** 代码语言 */
  language?: CodeLanguage;
  /** 代码主题 */
  theme?: CodeTheme;
  /** 是否显示行号 */
  lineNumbers?: boolean;
  /** 高亮的行号（逗号分隔或数组） */
  highlightLines?: string | number[];
  /** 起始行号 */
  startLine?: number;
  /** 是否可复制 */
  copyable?: boolean;
  /** 是否显示语言标签 */
  showLanguage?: boolean;
  /** 文件名 */
  filename?: string;
  /** 最大高度 */
  maxHeight?: string | number;
  /** 是否自动换行 */
  wrap?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 代码组件事件接口
 */
export interface ExCodeEmits {
  /** 复制成功事件 */
  copy: [code: string];
}

/**
 * 代码组件暴露的方法接口
 */
export interface ExCodeExposed {
  /** 获取代码内容 */
  getCode: () => string;
  /** 复制代码 */
  copy: () => Promise<void>;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
