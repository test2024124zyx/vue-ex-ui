import type { ExWatermarkProps, WatermarkFontStyle, WatermarkTextAlign } from './types';

export const DEFAULT_WATERMARK_GAP = 120;
export const DEFAULT_WATERMARK_FONT_SIZE = 14;
export const DEFAULT_WATERMARK_LINE_HEIGHT = 20;
export const DEFAULT_IMAGE_WIDTH = 120;
export const DEFAULT_IMAGE_HEIGHT = 64;
export const MAX_WATERMARK_DPR = 4;

const DEFAULT_TEXT_COLOR = 'rgba(0, 0, 0, 0.8)';
const DEFAULT_FONT_FAMILY = 'system-ui, sans-serif';
const DEFAULT_ANGLE = -30;
const TRIGONOMETRY_EPSILON = 1e-10;

const normalizeAngle = (value: number | undefined): number =>
  Number.isFinite(value) ? (value as number) % 360 : DEFAULT_ANGLE;

export interface WatermarkTile {
  dataUrl: string;
  width: number;
  height: number;
}

export interface WatermarkRenderOptions {
  props: ExWatermarkProps;
  text: string | string[];
  color: string;
  fontFamily: string;
  onError: (error: Error) => void;
}

interface TextMetricsSize {
  width: number;
  height: number;
}

interface PreparedContent {
  width: number;
  height: number;
  draw: (context: CanvasRenderingContext2D) => void;
}

/** 将任意数值限制到给定范围，非法数值使用回退值。 */
export function normalizeNumber(
  value: number | undefined,
  fallback: number,
  minimum = 0,
  maximum = Number.POSITIVE_INFINITY
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value as number));
}

/** 计算矩形绕中心旋转后的轴对齐包围盒。 */
export function getRotatedSize(width: number, height: number, angle: number): TextMetricsSize {
  const radians = (normalizeAngle(angle) * Math.PI) / 180;
  const rawCosine = Math.abs(Math.cos(radians));
  const rawSine = Math.abs(Math.sin(radians));
  const cosine = rawCosine < TRIGONOMETRY_EPSILON ? 0 : rawCosine;
  const sine = rawSine < TRIGONOMETRY_EPSILON ? 0 : rawSine;
  return {
    width: Math.ceil(width * cosine + height * sine),
    height: Math.ceil(width * sine + height * cosine),
  };
}

const getCanvasFont = (
  fontStyle: WatermarkFontStyle,
  fontWeight: NonNullable<ExWatermarkProps['fontWeight']>,
  fontSize: number,
  fontFamily: string
): string => `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

const getTextMetricHeight = (metrics: TextMetrics, fallback: number): number => {
  const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  if (Number.isFinite(fontHeight) && fontHeight > 0) return fontHeight;

  const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  return Number.isFinite(actualHeight) && actualHeight > 0 ? actualHeight : fallback;
};

const getTextX = (textAlign: WatermarkTextAlign, width: number): number => {
  if (textAlign === 'left') return -width / 2;
  if (textAlign === 'right') return width / 2;
  return 0;
};

const waitForFont = async (font: string, sample: string): Promise<void> => {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  try {
    await document.fonts.load(font, sample);
  } catch {
    // 字体加载失败时 Canvas 会自动使用字体栈中的后备字体。
  }
};

const loadImage = (
  src: string,
  crossOrigin: ExWatermarkProps['crossOrigin']
): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = crossOrigin ?? 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`[ExWatermark] 图片加载失败：${src}`));
    image.src = src;
  });

const prepareTextContent = async (
  context: CanvasRenderingContext2D,
  options: WatermarkRenderOptions
): Promise<PreparedContent | null> => {
  const { props } = options;
  const lines = Array.isArray(options.text) ? options.text : [options.text];
  if (lines.length === 0) return null;

  const fontSize = normalizeNumber(props.fontSize, DEFAULT_WATERMARK_FONT_SIZE, 1);
  const lineHeight = normalizeNumber(props.lineHeight, DEFAULT_WATERMARK_LINE_HEIGHT, 1);
  const fontStyle = props.fontStyle ?? 'normal';
  const fontWeight = props.fontWeight ?? 'normal';
  const fontFamily = options.fontFamily.trim() || DEFAULT_FONT_FAMILY;
  const font = getCanvasFont(fontStyle, fontWeight, fontSize, fontFamily);
  await waitForFont(font, lines.join(' '));
  context.font = font;

  const metrics = lines.map(line => context.measureText(line));
  const measuredWidth = Math.ceil(Math.max(0, ...metrics.map(metric => metric.width)));
  const measuredLineHeight = Math.ceil(
    Math.max(fontSize, ...metrics.map(metric => getTextMetricHeight(metric, fontSize)))
  );
  const measuredHeight = measuredLineHeight + Math.max(0, lines.length - 1) * lineHeight;
  const width = normalizeNumber(props.width, measuredWidth, 1);
  const height = normalizeNumber(props.height, measuredHeight, 1);
  const textAlign = props.textAlign ?? 'center';
  const startY = -((lines.length - 1) * lineHeight) / 2;

  return {
    width,
    height,
    draw: drawContext => {
      drawContext.font = font;
      drawContext.fillStyle = options.color.trim() || DEFAULT_TEXT_COLOR;
      drawContext.textAlign = textAlign;
      drawContext.textBaseline = 'middle';
      const textX = getTextX(textAlign, width);
      lines.forEach((line, index) => {
        drawContext.fillText(line, textX, startY + index * lineHeight);
      });
    },
  };
};

const prepareImageContent = async (
  options: WatermarkRenderOptions
): Promise<PreparedContent | null> => {
  const { props } = options;
  if (!props.imageSrc) return null;

  const image = await loadImage(props.imageSrc, props.crossOrigin);
  const aliasWidth = normalizeNumber(props.imageWidth, DEFAULT_IMAGE_WIDTH, 1);
  const aliasHeight = normalizeNumber(props.imageHeight, DEFAULT_IMAGE_HEIGHT, 1);
  const width = normalizeNumber(props.width, aliasWidth, 1);
  const height = normalizeNumber(props.height, aliasHeight, 1);
  return {
    width,
    height,
    draw: context => context.drawImage(image, -width / 2, -height / 2, width, height),
  };
};

const createMeasurementContext = (): CanvasRenderingContext2D | null => {
  if (typeof document === 'undefined') return null;
  return document.createElement('canvas').getContext('2d');
};

const getDevicePixelRatio = (dprAware: boolean | undefined): number => {
  if (!dprAware || typeof window === 'undefined') return 1;
  return normalizeNumber(window.devicePixelRatio, 1, 1, MAX_WATERMARK_DPR);
};

const drawPreparedContent = (
  context: CanvasRenderingContext2D,
  content: PreparedContent,
  x: number,
  y: number,
  angle: number
): void => {
  context.save();
  context.translate(x, y);
  context.rotate((angle * Math.PI) / 180);
  content.draw(context);
  context.restore();
};

/** 根据内容尺寸生成包含安全间距和可选错位布局的水印瓦片。 */
export async function renderWatermarkTile(options: WatermarkRenderOptions): Promise<WatermarkTile> {
  const measurementContext = createMeasurementContext();
  if (!measurementContext) {
    options.onError(new Error('[ExWatermark] 当前环境不支持 Canvas 2D'));
    return { dataUrl: '', width: 0, height: 0 };
  }

  let content: PreparedContent | null = null;
  if (options.props.type === 'image') {
    try {
      content = await prepareImageContent(options);
      if (!content) throw new Error('[ExWatermark] 图片水印缺少 imageSrc');
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      options.onError(normalizedError);
      content = await prepareTextContent(measurementContext, options);
    }
  } else {
    content = await prepareTextContent(measurementContext, options);
  }

  if (!content) return { dataUrl: '', width: 0, height: 0 };

  const angle = normalizeAngle(options.props.angle);
  const rotatedSize = getRotatedSize(content.width, content.height, angle);
  const gapX = normalizeNumber(options.props.gapX, DEFAULT_WATERMARK_GAP, 0);
  const gapY = normalizeNumber(options.props.gapY, DEFAULT_WATERMARK_GAP, 0);
  const cellWidth = Math.max(1, rotatedSize.width + gapX);
  const cellHeight = Math.max(1, rotatedSize.height + gapY);
  const staggered = Boolean(options.props.repeat && options.props.staggered);
  const tileWidth = cellWidth * (staggered ? 2 : 1);
  const tileHeight = cellHeight;
  const dpr = getDevicePixelRatio(options.props.dprAware);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(tileWidth * dpr));
  canvas.height = Math.max(1, Math.ceil(tileHeight * dpr));
  const context = canvas.getContext('2d');

  if (!context) {
    options.onError(new Error('[ExWatermark] 无法创建 Canvas 2D 上下文'));
    return { dataUrl: '', width: tileWidth, height: tileHeight };
  }

  context.scale(dpr, dpr);
  context.clearRect(0, 0, tileWidth, tileHeight);
  drawPreparedContent(context, content, cellWidth / 2, cellHeight / 2, angle);
  if (staggered) {
    drawPreparedContent(context, content, cellWidth * 1.5, 0, angle);
    drawPreparedContent(context, content, cellWidth * 1.5, cellHeight, angle);
  }

  try {
    return { dataUrl: canvas.toDataURL('image/png'), width: tileWidth, height: tileHeight };
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    options.onError(normalizedError);
    return { dataUrl: '', width: tileWidth, height: tileHeight };
  }
}
