/** 文件预览可辨识的错误代码。 */
export type ExFilePreviewErrorCode =
  | 'invalid-source'
  | 'http-error'
  | 'text-too-large'
  | 'load-failed';

export interface ExFilePreviewErrorOptions {
  /** 稳定错误代码，供调用方执行分支处理。 */
  code: ExFilePreviewErrorCode;
  /** HTTP 加载失败时的响应状态码。 */
  status?: number;
  /** 底层异常，保留诊断上下文。 */
  cause?: unknown;
}

/**
 * 文件预览的结构化异常。
 * 组件只报告能够确认的失败，不把浏览器原生事件伪装成业务结果。
 */
export class ExFilePreviewError extends Error {
  override readonly name = 'ExFilePreviewError';
  readonly code: ExFilePreviewErrorCode;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, options: ExFilePreviewErrorOptions) {
    super(message);
    this.code = options.code;
    this.status = options.status;
    this.cause = options.cause;
  }
}
