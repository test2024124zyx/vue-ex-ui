export type ImageCompressErrorCode =
  | 'INVALID_SOURCE'
  | 'SOURCE_FETCH_FAILED'
  | 'LOAD_FAILED'
  | 'INVALID_DIMENSION'
  | 'CANVAS_UNAVAILABLE'
  | 'ENCODE_FAILED'
  | 'UNSUPPORTED_OUTPUT'
  | 'UNSUPPORTED_MODE'
  | 'TARGET_UNREACHABLE'
  | 'ABORTED'
  | 'DOM_UNAVAILABLE';

/** 图片压缩失败的稳定错误类型，调用方可依据 code 精确处理。 */
export class ExImageCompressError extends Error {
  readonly code: ImageCompressErrorCode;
  readonly cause?: unknown;

  constructor(code: ImageCompressErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ExImageCompressError';
    this.code = code;
    this.cause = cause;
  }
}

/** 保留已分类错误，并把未知异常规范化为指定错误码。 */
export function toImageCompressError(
  error: unknown,
  code: ImageCompressErrorCode,
  fallbackMessage: string
): ExImageCompressError {
  if (error instanceof ExImageCompressError) return error;
  if (error instanceof BrowserImageError) {
    return new ExImageCompressError(error.code, error.message, error.cause ?? error);
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return new ExImageCompressError('ABORTED', '图片压缩已取消', error);
  }

  const message = error instanceof Error && error.message.trim() ? error.message : fallbackMessage;
  return new ExImageCompressError(code, message, error);
}
import { BrowserImageError } from '../../utils/image-resource';
