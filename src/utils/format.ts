/**
 * 格式化工具函数
 */

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;

/**
 * 格式化时间戳
 * @param timestamp 时间戳（毫秒）
 * @param format 格式字符串，默认 'HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number, format: string = 'HH:mm:ss'): string {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return '';

  const formatMap: Record<string, string> = {
    YYYY: date.getFullYear().toString().padStart(4, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
  };

  let formattedTime = format;
  Object.entries(formatMap).forEach(([key, value]) => {
    formattedTime = formattedTime.replace(new RegExp(key, 'g'), value);
  });

  return formattedTime;
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(size: number): string {
  const safeSize = Number.isFinite(size) && size > 0 ? size : 0;
  if (safeSize === 0) return '0 B';

  const unitIndex = Math.min(
    Math.floor(Math.log(safeSize) / Math.log(1024)),
    FILE_SIZE_UNITS.length - 1
  );
  const value = safeSize / 1024 ** unitIndex;

  // 最多保留两位小数，同时去掉无意义的尾随零。
  return `${Number(value.toFixed(2))} ${FILE_SIZE_UNITS[unitIndex]}`;
}
