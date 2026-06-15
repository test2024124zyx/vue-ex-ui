/**
 * 文件上传状态
 */
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error';

/**
 * 文件类型
 */
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

/**
 * 上传列表类型
 */
export type UploadListType = 'text' | 'picture' | 'picture-card';

/**
 * 文件项接口
 */
export interface UploadFile {
  /** 文件唯一标识 */
  uid: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件类型 */
  type: string;
  /** 上传状态 */
  status: UploadStatus;
  /** 上传进度 0-100 */
  percent?: number;
  /** 原始文件对象 */
  raw?: File;
  /** 文件URL（上传成功后） */
  url?: string;
  /** 缩略图URL */
  thumbUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 响应数据 */
  response?: unknown;
}

/**
 * 上传前钩子返回类型
 */
export type BeforeUploadResult = boolean | Promise<boolean> | File | Promise<File>;

/**
 * 文件上传组件属性
 */
export interface ExFileUploadProps {
  /** 上传地址 */
  action?: string;
  /** 上传请求头 */
  headers?: Record<string, string>;
  /** 上传时附带的额外参数 */
  data?: Record<string, unknown>;
  /** 上传的文件字段名 */
  name?: string;
  /** 是否支持多选 */
  multiple?: boolean;
  /** 是否支持拖拽上传 */
  drag?: boolean;
  /** 接受的文件类型 */
  accept?: string;
  /** 文件列表 */
  fileList?: UploadFile[];
  /** 最大上传数量 */
  limit?: number;
  /** 文件大小限制（MB） */
  maxSize?: number;
  /** 是否自动上传 */
  autoUpload?: boolean;
  /** 是否显示文件列表 */
  showFileList?: boolean;
  /** 文件列表类型 */
  listType?: UploadListType;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否携带cookie */
  withCredentials?: boolean;
  /** 提示文本 */
  tip?: string;
  /** 上传按钮文本 */
  buttonText?: string;
  /** 拖拽区域提示文本 */
  dragText?: string;
  /** 拖拽区域描述文本 */
  dragDescription?: string;
  /**
   * 上传前钩子。返回 false 阻止上传；返回 File（或其 Promise）替换待上传文件。
   * 在文件大小 / 类型校验通过后调用。
   */
  beforeUpload?: (file: File) => BeforeUploadResult;
}

/**
 * 文件上传组件事件
 */
export interface ExFileUploadEmits {
  /** 文件列表变化 */
  'update:fileList': [fileList: UploadFile[]];
  /** 文件选择后 */
  change: [file: UploadFile, fileList: UploadFile[]];
  /** 上传前 */
  beforeUpload: [file: File];
  /** 上传进度 */
  progress: [percent: number, file: UploadFile];
  /** 上传成功 */
  success: [response: unknown, file: UploadFile, fileList: UploadFile[]];
  /** 上传失败 */
  error: [error: Error, file: UploadFile, fileList: UploadFile[]];
  /** 文件移除 */
  remove: [file: UploadFile, fileList: UploadFile[]];
  /** 超出文件数量限制 */
  exceed: [files: File[], fileList: UploadFile[]];
  /** 文件超出大小限制（maxSize） */
  oversize: [file: File, maxSize: number];
  /** 文件类型不匹配 accept */
  'type-mismatch': [file: File, accept: string];
  /** 文件预览 */
  preview: [file: UploadFile];
}

/**
 * 文件上传组件暴露的方法
 */
export interface ExFileUploadExposed {
  /** 手动上传 */
  submit: () => void;
  /** 清空文件列表 */
  clearFiles: () => void;
  /** 中止上传 */
  abort: (file?: UploadFile) => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
