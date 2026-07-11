/** 文件上传传输阶段的稳定错误代码。 */
export type ExFileUploadErrorCode =
  | 'configuration-error'
  | 'request-error'
  | 'http-error'
  | 'timeout'
  | 'response-error';

export interface ExFileUploadErrorOptions {
  code: ExFileUploadErrorCode;
  /** HTTP 响应错误对应的状态码。 */
  status?: number;
  /** 底层异常，供日志和诊断使用。 */
  cause?: unknown;
}

/** 文件上传的结构化传输异常。 */
export class ExFileUploadError extends Error {
  override readonly name = 'ExFileUploadError';
  readonly code: ExFileUploadErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, options: ExFileUploadErrorOptions) {
    super(message);
    this.code = options.code;
    this.status = options.status;
    this.cause = options.cause;
  }
}
