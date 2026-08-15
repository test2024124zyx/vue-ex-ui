/** RGBA 颜色通道。 */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** HSVA 颜色通道。 */
export interface HSVA {
  /** 色相，范围为 0～360。 */
  h: number;
  /** 饱和度，范围为 0～1。 */
  s: number;
  /** 明度，范围为 0～1。 */
  v: number;
  /** 透明度，范围为 0～1。 */
  a: number;
}

export type ColorFormat = 'hex' | 'rgb';

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeFinite = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const normalizeChannel = (value: number): number =>
  clamp(Math.round(normalizeFinite(value, 0)), 0, 255);

const normalizeAlpha = (value: number): number => clamp(normalizeFinite(value, 1), 0, 1);

/** 按 HSV 色相扇区返回未叠加明度偏移的 RGB 通道。 */
const resolveHueSector = (
  hue: number,
  chroma: number,
  secondary: number
): [number, number, number] => {
  if (hue < 60) return [chroma, secondary, 0];
  if (hue < 120) return [secondary, chroma, 0];
  if (hue < 180) return [0, chroma, secondary];
  if (hue < 240) return [0, secondary, chroma];
  if (hue < 300) return [secondary, 0, chroma];
  return [chroma, 0, secondary];
};

/** 将 HSV 转换为 RGB，并约束异常输入，避免向样式层传播 NaN。 */
export function hsvToRgb(h: number, s: number, v: number): Pick<RGBA, 'r' | 'g' | 'b'> {
  h = ((normalizeFinite(h, 0) % 360) + 360) % 360;
  s = clamp(normalizeFinite(s, 0), 0, 1);
  v = clamp(normalizeFinite(v, 0), 0, 1);

  const chroma = v * s;
  const secondary = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const offset = v - chroma;
  const [red, green, blue] = resolveHueSector(h, chroma, secondary);

  return {
    r: Math.round((red + offset) * 255),
    g: Math.round((green + offset) * 255),
    b: Math.round((blue + offset) * 255),
  };
}

/** 将 RGB 转换为 HSV。 */
export function rgbToHsv(r: number, g: number, b: number): Pick<HSVA, 'h' | 's' | 'v'> {
  r = normalizeChannel(r) / 255;
  g = normalizeChannel(g) / 255;
  b = normalizeChannel(b) / 255;

  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const difference = maximum - minimum;
  let hue = 0;

  if (difference !== 0) {
    if (maximum === r) hue = ((g - b) / difference) % 6;
    else if (maximum === g) hue = (b - r) / difference + 2;
    else hue = (r - g) / difference + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  const saturation = maximum === 0 ? 0 : difference / maximum;
  return { h: hue, s: saturation, v: maximum };
}

const toHexChannel = (value: number): string =>
  normalizeChannel(value).toString(16).padStart(2, '0');

/** 将 RGB 转换为六位十六进制颜色。 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

const CSS_NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

const parsePercentageOrNumber = (
  token: string,
  numberMaximum: number,
  percentageScale: number
): number | null => {
  const value = token.trim();
  const isPercentage = value.endsWith('%');
  const numericText = isPercentage ? value.slice(0, -1).trim() : value;
  if (!CSS_NUMBER_PATTERN.test(numericText)) return null;

  const numericValue = Number(numericText);
  const maximum = isPercentage ? 100 : numberMaximum;
  if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > maximum) return null;
  return isPercentage ? (numericValue / 100) * percentageScale : numericValue;
};

const parseRgbChannel = (token: string): number | null => {
  const value = parsePercentageOrNumber(token, 255, 255);
  return value === null ? null : Math.round(value);
};

const parseAlphaChannel = (token: string): number | null => parsePercentageOrNumber(token, 1, 1);

/**
 * 解析十六进制及逗号分隔的 rgb/rgba 颜色。
 * 参数数量和范围不合法时返回 null，避免浏览器容错导致跨环境结果不一致。
 */
export function parseColor(input: string): RGBA | null {
  if (typeof input !== 'string') return null;
  const color = input.trim().toLowerCase();
  if (!color) return null;

  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hexMatch) {
    let hex = hexMatch[1]!;
    if (hex.length === 3 || hex.length === 4) {
      hex = [...hex].map(character => `${character}${character}`).join('');
    }

    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  const functionalMatch = color.match(/^(rgb|rgba)\((.*)\)$/);
  if (!functionalMatch) return null;
  const functionName = functionalMatch[1]!;
  const parts = functionalMatch[2]!.split(',').map(part => part.trim());
  const expectedLength = functionName === 'rgba' ? 4 : 3;
  if (parts.length !== expectedLength || parts.some(part => !part)) return null;

  const red = parseRgbChannel(parts[0]!);
  const green = parseRgbChannel(parts[1]!);
  const blue = parseRgbChannel(parts[2]!);
  const alpha = functionName === 'rgba' ? parseAlphaChannel(parts[3]!) : 1;
  if (red === null || green === null || blue === null || alpha === null) return null;
  return { r: red, g: green, b: blue, a: alpha };
}

/** 按指定格式输出颜色；启用 Alpha 时始终保留透明通道，确保返回值结构稳定。 */
export function formatColor(rgba: RGBA, format: ColorFormat, showAlpha: boolean): string {
  const red = normalizeChannel(rgba.r);
  const green = normalizeChannel(rgba.g);
  const blue = normalizeChannel(rgba.b);
  const alpha = normalizeAlpha(rgba.a);

  if (format === 'rgb') {
    if (!showAlpha) return `rgb(${red}, ${green}, ${blue})`;
    const roundedAlpha = Math.round(alpha * 1000) / 1000;
    return `rgba(${red}, ${green}, ${blue}, ${roundedAlpha})`;
  }

  const hex = rgbToHex(red, green, blue);
  return showAlpha ? `${hex}${toHexChannel(alpha * 255)}` : hex;
}

/** 返回不含透明度的 RGB 字符串，用作透明度渐变终点。 */
export function opaqueRgb(rgba: RGBA): string {
  return `rgb(${normalizeChannel(rgba.r)}, ${normalizeChannel(rgba.g)}, ${normalizeChannel(rgba.b)})`;
}
