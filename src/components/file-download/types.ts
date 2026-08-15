import type { VNode } from 'vue';
import type { ButtonSize, ButtonType } from '../button/types';
import type { ExFileDownloadError } from './errors';

/** 下载传输方式。link 由浏览器接管，fetch/xhr 可报告进度并取消。 */
export type ExFileDownloadTransport = 'link' | 'fetch' | 'xhr';
export type ExFileDownloadRequestTransport = Exclude<ExFileDownloadTransport, 'link'>;

/** 组件当前状态。triggered 仅表示链接已交给浏览器，不代表文件保存成功。 */
export type ExFileDownloadStatus = 'idle' | 'downloading' | 'triggered' | 'success' | 'error';

/** 下载进度；响应未提供总大小时 total 与 percent 均为 null。 */
export interface ExFileDownloadProgress {
  loaded: number;
  total: number | null;
  percent: number | null;
}

/** download() 的可判别结果，所有正常、忽略、取消和错误路径都会收敛。 */
export type ExFileDownloadResult =
  | {
      outcome: 'triggered';
      transport: 'link';
      url: string;
      filename: string;
    }
  | {
      outcome: 'success';
      transport: ExFileDownloadRequestTransport;
      blob: Blob;
      filename: string;
    }
  | {
      outcome: 'cancelled';
      transport: ExFileDownloadRequestTransport;
    }
  | {
      outcome: 'ignored';
      reason: 'disabled' | 'busy';
    }
  | {
      outcome: 'error';
      error: ExFileDownloadError;
    };

/** FileDownload 组件属性。 */
export interface ExFileDownloadProps {
  /** 下载地址，仅允许 HTTP、HTTPS、Blob 和相对地址。 */
  url: string;
  /** 建议文件名；浏览器对跨域 link 下载可能忽略该值。 */
  filename?: string;
  /** 下载传输方式。 */
  transport?: ExFileDownloadTransport;
  /** fetch/xhr 下载中是否展示进度。 */
  showProgress?: boolean;
  /** fetch/xhr 请求头。 */
  headers?: Record<string, string>;
  /** fetch/xhr 允许缓冲的最大字节数，默认 512 MiB。 */
  maxBytes?: number;
  /** fetch 使用 include 凭证，xhr 设置 withCredentials。 */
  withCredentials?: boolean;
  /** 固定按钮文案；未提供时按状态显示本地化文案。 */
  buttonText?: string;
  /** 默认按钮类型。 */
  buttonType?: ButtonType;
  /** 默认按钮尺寸。 */
  buttonSize?: ButtonSize;
  /** 是否禁用下载。 */
  disabled?: boolean;
}

/** FileDownload 组件事件。 */
export interface ExFileDownloadEmits {
  /** 组件开始处理一次有效下载。 */
  start: [transport: ExFileDownloadTransport];
  /** fetch/xhr 已读取的数据进度。 */
  progress: [progress: ExFileDownloadProgress];
  /** link 已交给浏览器处理，不表示下载成功。 */
  trigger: [url: string, filename: string];
  /** fetch/xhr 响应读取完成并已创建浏览器下载。 */
  success: [blob: Blob, filename: string];
  /** 下载输入、协议、HTTP 或网络错误。 */
  error: [error: ExFileDownloadError];
  /** 活动的 fetch/xhr 请求已被调用方取消。 */
  cancel: [];
}

export interface ExFileDownloadSlotProps {
  download: () => Promise<ExFileDownloadResult>;
  cancel: () => boolean;
  status: ExFileDownloadStatus;
  progress: ExFileDownloadProgress;
  disabled: boolean;
}

/** FileDownload 组件插槽。 */
export interface ExFileDownloadSlots {
  /** 自定义下载触发器。 */
  default?: (props: ExFileDownloadSlotProps) => VNode[];
  /** 自定义活动请求的进度视图。 */
  progress?: (props: { progress: ExFileDownloadProgress }) => VNode[];
}

/** FileDownload 组件公开实例。 */
export interface ExFileDownloadExposed {
  /** 触发下载并返回可判别结果。 */
  download: () => Promise<ExFileDownloadResult>;
  /** 取消真实活动的 fetch/xhr 请求。 */
  cancel: () => boolean;
  /** 获取根元素。 */
  getElement: () => HTMLDivElement | null;
}
