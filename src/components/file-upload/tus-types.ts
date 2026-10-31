import type { UploadConfigResolver } from './types';

/** tus 1.0.0 客户端配置；单文件按偏移顺序分片，不要求服务端 Concatenation 扩展。 */
export interface UploadTusOptions {
  /** 单次 PATCH 的最大字节数；省略时遵循 tus 客户端默认，不人为切小请求。 */
  chunkSize?: number;
  /** 自动重试间隔，单位毫秒；空数组表示不重试。 */
  retryDelays?: readonly number[];
  /** 创建上传时的字符串元数据；默认包含 filename 和 filetype。 */
  metadata?: Record<string, string> | UploadConfigResolver<Record<string, string>>;
  /** 是否查找并持久保存断点；默认为 true，成功后清理本地记录。 */
  resume?: boolean;
  /** 账户或业务作用域，参与续传指纹；切换账户时应同步更新。 */
  resumeKey?: string;
  /** 允许上传资源使用的额外来源；默认仅允许 action 所属来源。 */
  allowedOrigins?: readonly string[];
}

/** tus 成功仅证明上传资源已完成，不假定该地址可以直接下载。 */
export interface UploadTusResponse {
  uploadUrl: string;
}

/** 永久取消结果；terminated 为 true 才代表服务端已确认删除资源。 */
export interface UploadCancelResult {
  uid: string;
  cancelled: boolean;
  terminated: boolean;
  error?: import('./errors').ExFileUploadError;
}
