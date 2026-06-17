/**
 * 下载状态
 */
export type DownloadStatus = 'idle' | 'downloading' | 'success' | 'error' | 'paused';

/**
 * 下载方式
 */
export type DownloadMethod = 'link' | 'fetch' | 'xhr';

/**
 * 文件下载组件属性
 */
export interface ExFileDownloadProps {
  /** 下载URL */
  url: string;
  /** 文件名 */
  filename?: string;
  /** 下载方式 */
  method?: DownloadMethod;
  /** 是否显示进度 */
  showProgress?: boolean;
  /** 是否自动下载 */
  autoDownload?: boolean;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 是否携带cookie */
  withCredentials?: boolean;
  /** 按钮文本 */
  buttonText?: string;
  /** 按钮类型 */
  buttonType?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  /** 按钮尺寸 */
  buttonSize?: 'small' | 'medium' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 文件下载组件事件
 */
export interface ExFileDownloadEmits {
  /** 下载开始 */
  start: [];
  /** 下载进度 */
  progress: [percent: number, loaded: number, total: number];
  /** 下载成功 */
  success: [blob: Blob];
  /** 下载失败 */
  error: [error: Error];
  /** 下载暂停 */
  pause: [];
  /** 下载恢复 */
  resume: [];
  /** 下载取消 */
  cancel: [];
}

/**
 * 文件下载组件暴露的方法
 */
export interface ExFileDownloadExposed {
  /** 开始下载 */
  download: () => void;
  /** 暂停下载 */
  pause: () => void;
  /** 恢复下载 */
  resume: () => void;
  /** 取消下载 */
  cancel: () => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
