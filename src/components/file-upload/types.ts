import type { ExFileUploadError } from './errors';
import type { UploadCancelResult, UploadTusOptions } from './tus-types';
export type * from './tus-types';

/** 上传文件状态。 */
export type UploadStatus =
  'ready' | 'queued' | 'uploading' | 'paused' | 'cancelling' | 'success' | 'error';

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
  /** tus 上传资源地址，用于续传；它不等同于可下载文件地址。 */
  tusUploadUrl?: string;
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
  'accept' | 'size' | 'limit' | 'multiple' | 'before-add' | 'before-add-error';

/** 选择阶段的可判别拒绝结果。 */
export interface UploadRejection {
  code: UploadRejectionCode;
  file: File;
  accept?: string;
  maxFileSize?: number;
  limit?: number;
  cause?: unknown;
}

export type UploadIgnoredReason =
  'no-action' | 'missing-raw' | 'not-ready' | 'disabled' | 'readonly';
export type UploadOutcome = 'success' | 'error' | 'aborted' | 'paused' | 'ignored';

/** 单个文件上传任务的最终结果。 */
export interface UploadResult {
  uid: string;
  outcome: UploadOutcome;
  response?: unknown;
  error?: ExFileUploadError;
  reason?: UploadIgnoredReason;
}

export type UploadAbortReason =
  'manual' | 'remove' | 'clear' | 'external' | 'disabled' | 'readonly' | 'pause' | 'cancel';

/** 文件上传组件属性。 */
export interface ExFileUploadProps {
  /** 显式选择普通 multipart 或 tus 1.0.0；默认保持 xhr 上传。 */
  transport?: 'xhr' | 'tus';
  /** 同时活动的文件数量；默认 3，Infinity 表示不限制。 */
  concurrency?: number;
  /** tus 顺序分片、重试、持久续传和元数据配置。 */
  tus?: UploadTusOptions;
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
  /** 禁用选择、预览、移除及程序化上传/清空；继承 Form 状态。 */
  disabled?: boolean;
  /** 是否只读；保留预览，禁止选择、移除、清空及发起新上传。 */
  readonly?: boolean;
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
  paused: [file: UploadFile, fileList: UploadFile[]];
  resumed: [file: UploadFile, fileList: UploadFile[]];
  cancelled: [result: UploadCancelResult, file: UploadFile, fileList: UploadFile[]];
  'resume-unavailable': [error: unknown, file: UploadFile];
  'remove-request': [file: UploadFile];
  'preview-request': [file: UploadFile];
}

/** 文件上传组件公开方法。 */
export interface ExFileUploadExposed {
  /** 打开原生文件选择器；无法操作时返回 false。 */
  openFileDialog: () => boolean;
  /** 上传指定 ready 文件，未指定时上传全部；禁用/只读的新任务返回 ignored。 */
  submit: (file?: UploadFile | string) => Promise<UploadResult[]>;
  /** 中止指定任务，未指定时中止全部；返回真实中止数量。 */
  abort: (file?: UploadFile | string) => number;
  /** 暂停 tus 活动或排队任务并保留断点；返回实际暂停数量。 */
  pause: (file?: UploadFile | string) => number;
  /** 继续暂停的 tus 文件，重试失败文件；仍受文件并发和字段状态约束。 */
  resume: (file?: UploadFile | string) => Promise<UploadResult[]>;
  /** 永久取消 tus 资源，需要服务端 Termination 扩展；失败不会伪装为成功。 */
  cancel: (file?: UploadFile | string) => Promise<UploadCancelResult[]>;
  /** 中止全部任务并请求清空列表；禁用/只读时不操作并返回 0。 */
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
