/**
 * 格式化工具函数
 */

/**
 * 格式化时间戳
 * @param timestamp 时间戳（毫秒）
 * @param format 格式字符串，默认 'HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number, format: string = 'HH:mm:ss'): string {
  const date = new Date(timestamp);

  const formatMap: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
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
  if (size === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${(size / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}
