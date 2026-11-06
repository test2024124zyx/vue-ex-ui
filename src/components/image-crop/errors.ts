import { BrowserImageError } from '../../utils/image-resource';

export type ImageCropErrorCode =
  | 'INVALID_SOURCE'
  | 'SOURCE_FETCH_FAILED'
  | 'LOAD_FAILED'
  | 'INVALID_DIMENSION'
  | 'INVALID_CONFIGURATION'
  | 'NOT_READY'
  | 'INVALID_AREA'
  | 'CANVAS_UNAVAILABLE'
  | 'ENCODE_FAILED'
  | 'UNSUPPORTED_OUTPUT'
  | 'ABORTED'
  | 'DOM_UNAVAILABLE';

/** 图片裁剪失败的公开稳定错误，业务可依据 code 做精确处理。 */
export class ExImageCropError extends Error {
  readonly code: ImageCropErrorCode;
  readonly cause?: unknown;

  constructor(code: ImageCropErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'ExImageCropError';
    this.code = code;
    this.cause = cause;
  }
}

/** 把共享图片错误和未知异常统一为裁剪组件错误。 */
export function toImageCropError(
  error: unknown,
  code: ImageCropErrorCode,
  fallbackMessage: string
): ExImageCropError {
  if (error instanceof ExImageCropError) return error;
  if (error instanceof BrowserImageError) {
    return new ExImageCropError(error.code, error.message, error.cause ?? error);
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return new ExImageCropError('ABORTED', '图片裁剪已取消', error);
  }

  const message = error instanceof Error && error.message.trim() ? error.message : fallbackMessage;
  return new ExImageCropError(code, message, error);
}
