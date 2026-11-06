/**
 * 简化的二维码生成器
 * 基于 qrcode 库的核心功能
 */

interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

const normalizeWidth = (width: number | undefined): number =>
  Number.isFinite(width) ? Math.min(2048, Math.max(32, width as number)) : 200;

// 错误纠正级别
// const _ErrorCorrectionLevel = {
//   L: 1,
//   M: 0,
//   Q: 3,
//   H: 2,
// };

// 简化的二维码生成（使用第三方库的接口）
class QRCodeGenerator {
  static async toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    // 动态导入 qrcode 库
    const QRCode = await import('qrcode');

    const opts = {
      width: normalizeWidth(options.width),
      margin: options.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#ffffff',
      },
    };

    await QRCode.toCanvas(canvas, text, opts);
  }

  static async toDataURL(text: string, options: QRCodeOptions = {}): Promise<string> {
    const QRCode = await import('qrcode');

    const opts = {
      width: normalizeWidth(options.width),
      margin: options.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#ffffff',
      },
    };

    return await QRCode.toDataURL(text, opts);
  }
}

export default QRCodeGenerator;
