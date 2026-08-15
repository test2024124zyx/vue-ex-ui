/** 文件下载错误码，调用方可据此区分输入、协议、HTTP 与运行环境问题。 */
export type ExFileDownloadErrorCode =
  | 'invalid-url'
  | 'invalid-transport'
  | 'http-error'
  | 'network-error'
  | 'size-exceeded'
  | 'unsupported';

export interface ExFileDownloadErrorOptions {
  status?: number;
  cause?: unknown;
}

/** FileDownload 对外抛出的稳定错误类型。 */
export class ExFileDownloadError extends Error {
  override readonly name = 'ExFileDownloadError';
  readonly code: ExFileDownloadErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(
    code: ExFileDownloadErrorCode,
    message: string,
    options: ExFileDownloadErrorOptions = {}
  ) {
    super(message);
    this.code = code;
    this.status = options.status;
    this.cause = options.cause;
  }
}
