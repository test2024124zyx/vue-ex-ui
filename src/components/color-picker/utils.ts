// ExUI ColorPicker 颜色转换工具

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSVA {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
  a: number; // 0-1
}

export type ColorFormat = 'hex' | 'rgb';

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

/** HSV -> RGB（h:0-360, s/v:0-1） */
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  v = clamp(v, 0, 1);
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** RGB -> HSV */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

const hex2 = (n: number): string => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');

/** RGB -> #rrggbb */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

/** 解析颜色字符串（hex / rgb / rgba），失败返回 null */
export function parseColor(str: string): RGBA | null {
  if (!str) return null;
  const s = str.trim().toLowerCase();

  const hexMatch = s.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let h = hexMatch[1]!;
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length === 6) {
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
    }
    if (h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: parseInt(h.slice(6, 8), 16) / 255,
      };
    }
    return null;
  }

  const rgbMatch = s.match(/^rgba?\(([^)]+)\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1]!.split(',').map(p => p.trim());
    const r = parseInt(parts[0]!, 10);
    const g = parseInt(parts[1]!, 10);
    const b = parseInt(parts[2]!, 10);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if ([r, g, b].some(n => Number.isNaN(n))) return null;
    return { r, g, b, a: Number.isNaN(a) ? 1 : clamp(a, 0, 1) };
  }

  return null;
}

/** 按格式输出颜色字符串 */
export function formatColor(rgba: RGBA, format: ColorFormat, showAlpha: boolean): string {
  const { r, g, b, a } = rgba;
  if (format === 'rgb') {
    return showAlpha && a < 1
      ? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`
      : `rgb(${r}, ${g}, ${b})`;
  }
  const hex = rgbToHex(r, g, b);
  if (showAlpha && a < 1) {
    return `${hex}${hex2(a * 255)}`;
  }
  return hex;
}

/** 不含透明度的纯色（用于透明度滑块渐变终点） */
export function opaqueRgb(rgba: RGBA): string {
  return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
}
