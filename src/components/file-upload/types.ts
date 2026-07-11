import type { ExFileUploadError } from './errors';

/** 上传文件状态。 */
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

/** 上传列表展示类型。 */
export type UploadListType = 'text' | 'picture' | 'picture-card';

/** 内建 XHR 传输支持的方法。 */
export type UploadHttpMethod = 'POST' | 'PUT' | 'PATCH';

/** 上传文件项。 */
export interface UploadFile {
  uid: string;
  name: string;
  /** 文件大小，单位为字节。 */
  size: number;
  /** MIME 类型。 */
  type: string;
  status: UploadStatus;
  /** 上传进度，组件写入时始终为 0 至 100 的整数。 */
  percent?: number;
  /** 原始文件；需要由内建传输上传的 ready 文件必须提供。 */
  raw?: File;
  /** 服务端文件地址。 */
  url?: string;
  /** 外部提供的缩略图地址。 */
  thumbUrl?: string;
  /** 最近一次失败的可读信息。 */
  error?: string;
  /** 服务端响应。 */
  response?: unknown;
}

export interface UploadResolveContext {
  /** 动态配置解析和 XHR 使用同一中止信号。 */
  signal: AbortSignal;
}

export type UploadActionResolver = (
  file: UploadFile,
  context: UploadResolveContext
) => string | Promise<string>;
export type UploadAction = string | UploadActionResolver;

export type UploadDataValue = string | number | boolean | Blob | null | undefined;
export type UploadData = Record<string, UploadDataValue>;
export type UploadHeaders = Record<string, string>;
export type UploadConfigResolver<T> = (
  file: UploadFile,
  context: UploadResolveContext
) => T | Promise<T>;

export type BeforeAddResult = File | false | void;
export type BeforeAdd = (
  file: File,
  currentFiles: readonly UploadFile[]
) => BeforeAddResult | Promise<BeforeAddResult>;

export type UploadRejectionCode =
  | 'accept'
  | 'size'
  | 'limit'
  | 'multiple'
  | 'before-add'
  | 'before-add-error';

/** 选择阶段的可判别拒绝结果。 */
export interface UploadRejection {
  code: UploadRejectionCode;
  file: File;
  accept?: string;
  maxFileSize?: number;
  limit?: number;
  cause?: unknown;
}

export type UploadIgnoredReason = 'no-action' | 'missing-raw' | 'not-ready';
export type UploadOutcome = 'success' | 'error' | 'aborted' | 'ignored';

/** 单个文件上传任务的最终结果。 */
export interface UploadResult {
  uid: string;
  outcome: UploadOutcome;
  response?: unknown;
  error?: ExFileUploadError;
  reason?: UploadIgnoredReason;
}

export type UploadAbortReason = 'manual' | 'remove' | 'clear' | 'external';

/** 文件上传组件属性。 */
export interface ExFileUploadProps {
  /** 上传地址或可中止的动态地址解析器。 */
  action?: UploadAction;
  /** 上传请求方法。 */
  method?: UploadHttpMethod;
  /** 静态请求头或动态请求头解析器。 */
  headers?: UploadHeaders | UploadConfigResolver<UploadHeaders>;
  /** 静态附加数据或动态附加数据解析器。 */
  data?: UploadData | UploadConfigResolver<UploadData>;
  /** multipart 文件字段名。 */
  name?: string;
  /** 是否允许一次选择多个文件。 */
  multiple?: boolean;
  /** 是否显示拖拽选择区。 */
  drag?: boolean;
  /** 原生 accept 规则；拖拽文件也会执行相同校验。 */
  accept?: string;
  /** 受控文件列表。 */
  fileList?: UploadFile[];
  /** 非受控模式的初始文件列表。 */
  defaultFileList?: UploadFile[];
  /** 最大文件数量。 */
  limit?: number;
  /** 单个文件最大字节数。 */
  maxFileSize?: number;
  /** 选择通过后是否自动上传。 */
  autoUpload?: boolean;
  /** 是否显示文件列表。 */
  showFileList?: boolean;
  /** 文件列表展示类型。 */
  listType?: UploadListType;
  /** 是否禁用选择、预览和移除交互。 */
  disabled?: boolean;
  /** XHR 是否携带跨域凭证。 */
  withCredentials?: boolean;
  /** XHR 超时时间，单位毫秒；0 表示不限制。 */
  timeout?: number;
  /** 提示文本。 */
  tip?: string;
  /** 选择按钮文本。 */
  buttonText?: string;
  /** 拖拽区域主文本。 */
  dragText?: string;
  /** 拖拽区域补充文本。 */
  dragDescription?: string;
  /** 加入列表前的异步转换或守卫。 */
  beforeAdd?: BeforeAdd;
  /** 根分组的无障碍名称。 */
  ariaLabel?: string;
}

/** 文件上传组件事件。 */
export interface ExFileUploadEmits {
  'update:fileList': [fileList: UploadFile[]];
  added: [file: UploadFile, fileList: UploadFile[]];
  rejected: [rejection: UploadRejection, fileList: UploadFile[]];
  progress: [file: UploadFile, fileList: UploadFile[]];
  success: [response: unknown, file: UploadFile, fileList: UploadFile[]];
  error: [error: ExFileUploadError, file: UploadFile, fileList: UploadFile[]];
  aborted: [file: UploadFile, fileList: UploadFile[], reason: UploadAbortReason];
  'remove-request': [file: UploadFile];
  'preview-request': [file: UploadFile];
}

/** 文件上传组件公开方法。 */
export interface ExFileUploadExposed {
  /** 打开原生文件选择器；无法操作时返回 false。 */
  openFileDialog: () => boolean;
  /** 上传指定 ready 文件，未指定时上传全部 ready 文件。 */
  submit: (file?: UploadFile | string) => Promise<UploadResult[]>;
  /** 中止指定任务，未指定时中止全部；返回真实中止数量。 */
  abort: (file?: UploadFile | string) => number;
  /** 中止全部任务并请求清空列表；返回真实中止数量。 */
  requestClear: () => number;
  /** 获取当前真实生效的文件列表快照。 */
  getFiles: () => UploadFile[];
  /** 获取组件根元素。 */
  getElement: () => HTMLDivElement | null;
}

/** 文件上传组件插槽。 */
export interface ExFileUploadSlots {
  trigger?: (props: { disabled: boolean; openFileDialog: () => boolean }) => unknown;
  'drag-icon'?: () => unknown;
  tip?: () => unknown;
}
