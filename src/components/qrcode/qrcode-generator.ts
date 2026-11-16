/**
 * 简化的二维码生成器
 * 基于 qrcode 库的核心功能
 */

import { normalizeQRCodeOptions, type QRCodeOptions } from './qrcode-options';

// 简化的二维码生成（使用第三方库的接口）
class QRCodeGenerator {
  static async toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    const normalized = normalizeQRCodeOptions(options);
    const QRCode = await import('qrcode');
    await QRCode.toCanvas(canvas, text, normalized);
  }

  static async toDataURL(text: string, options: QRCodeOptions = {}): Promise<string> {
    const normalized = normalizeQRCodeOptions(options);
    const QRCode = await import('qrcode');
    return QRCode.toDataURL(text, normalized);
  }
}

export default QRCodeGenerator;
