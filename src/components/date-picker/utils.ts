import type { DateUtils } from './types';

// 日期格式化映射
const formatTokens: Record<string, (date: Date) => string> = {
  YYYY: (date: Date) => date.getFullYear().toString(),
  YY: (date: Date) => date.getFullYear().toString().slice(-2),
  MM: (date: Date) => (date.getMonth() + 1).toString().padStart(2, '0'),
  M: (date: Date) => (date.getMonth() + 1).toString(),
  DD: (date: Date) => date.getDate().toString().padStart(2, '0'),
  D: (date: Date) => date.getDate().toString(),
  HH: (date: Date) => date.getHours().toString().padStart(2, '0'),
  H: (date: Date) => date.getHours().toString(),
  mm: (date: Date) => date.getMinutes().toString().padStart(2, '0'),
  m: (date: Date) => date.getMinutes().toString(),
  ss: (date: Date) => date.getSeconds().toString().padStart(2, '0'),
  s: (date: Date) => date.getSeconds().toString(),
  SSS: (date: Date) => date.getMilliseconds().toString().padStart(3, '0'),
};

// 解析格式化映射
const parseTokens: Record<string, RegExp> = {
  YYYY: /(\d{4})/,
  YY: /(\d{2})/,
  MM: /(\d{1,2})/,
  M: /(\d{1,2})/,
  DD: /(\d{1,2})/,
  D: /(\d{1,2})/,
  HH: /(\d{1,2})/,
  H: /(\d{1,2})/,
  mm: /(\d{1,2})/,
  m: /(\d{1,2})/,
  ss: /(\d{1,2})/,
  s: /(\d{1,2})/,
  SSS: /(\d{1,3})/,
};

// 月份名称
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const monthNamesZh = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

// 星期名称
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const weekdayNamesZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/**
 * 日期工具类
 */
export const dateUtils: DateUtils = {
  /**
   * 格式化日期
   */
  format(date: Date, format: string): string {
    if (!this.isValid(date)) return '';

    let result = format;

    // 按长度排序，避免短的先匹配导致问题
    const tokens = Object.keys(formatTokens).sort((a, b) => b.length - a.length);

    for (const token of tokens) {
      if (result.includes(token)) {
        const formatter = formatTokens[token];
        if (formatter) {
          result = result.replace(new RegExp(token, 'g'), formatter(date));
        }
      }
    }

    return result;
  },

  /**
   * 解析日期字符串
   */
  parse(dateString: string, format: string): Date | null {
    if (!dateString || !format) return null;

    // 按长度排序，避免短 token 抢先匹配（如 YY 命中 YYYY 内部）
    const tokens = Object.keys(parseTokens).sort((a, b) => b.length - a.length);

    // 记录每个 token 在格式串中的出现位置：
    // 正则捕获组的顺序由 token 在格式串中的位置决定（而非替换顺序），
    // 否则 'DD/MM/YYYY' 这类格式会发生组错位
    const found: Array<{ token: string; index: number }> = [];
    let scratch = format;
    let regex = format;

    for (const token of tokens) {
      const index = scratch.indexOf(token);
      if (index !== -1) {
        found.push({ token, index });
        // 用占位符抹除已匹配的 token，防止其子串被重复识别
        scratch = scratch.replace(new RegExp(token, 'g'), '#'.repeat(token.length));
        const tokenRegex = parseTokens[token];
        if (tokenRegex) {
          regex = regex.replace(new RegExp(token, 'g'), tokenRegex.source);
        }
      }
    }

    found.sort((a, b) => a.index - b.index);
    const tokenOrder = found.map(item => item.token);

    const match = dateString.match(new RegExp(`^${regex}$`));
    if (!match) return null;

    // 提取匹配的值
    const values: Record<string, number> = {};
    for (let i = 0; i < tokenOrder.length; i++) {
      const token = tokenOrder[i];
      const matchValue = match[i + 1];
      if (matchValue && token) {
        const value = parseInt(matchValue, 10);
        values[token] = value;
      }
    }

    // 构建日期
    const year = values.YYYY || (values.YY ? 2000 + values.YY : new Date().getFullYear());
    const month = (values.MM || values.M || 1) - 1;
    const day = values.DD || values.D || 1;
    const hour = values.HH || values.H || 0;
    const minute = values.mm || values.m || 0;
    const second = values.ss || values.s || 0;
    const millisecond = values.SSS || 0;

    const result = new Date(year, month, day, hour, minute, second, millisecond);

    return this.isValid(result) ? result : null;
  },

  /**
   * 检查是否为有效日期
   */
  isValid(date: unknown): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * 检查两个日期是否相同
   */
  isSame(date1: Date, date2: Date, unit = 'day'): boolean {
    if (!this.isValid(date1) || !this.isValid(date2)) return false;

    switch (unit) {
      case 'year':
        return date1.getFullYear() === date2.getFullYear();
      case 'month':
        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
      case 'day':
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
      case 'hour':
        return this.isSame(date1, date2, 'day') && date1.getHours() === date2.getHours();
      case 'minute':
        return this.isSame(date1, date2, 'hour') && date1.getMinutes() === date2.getMinutes();
      case 'second':
        return this.isSame(date1, date2, 'minute') && date1.getSeconds() === date2.getSeconds();
      default:
        return date1.getTime() === date2.getTime();
    }
  },

  /**
   * 检查第一个日期是否在第二个日期之后
   */
  isAfter(date1: Date, date2: Date): boolean {
    if (!this.isValid(date1) || !this.isValid(date2)) return false;
    return date1.getTime() > date2.getTime();
  },

  /**
   * 检查第一个日期是否在第二个日期之前
   */
  isBefore(date1: Date, date2: Date): boolean {
    if (!this.isValid(date1) || !this.isValid(date2)) return false;
    return date1.getTime() < date2.getTime();
  },

  /**
   * 获取日期的开始时间
   */
  startOf(date: Date, unit: string): Date {
    if (!this.isValid(date)) return new Date(NaN);

    const result = new Date(date);

    switch (unit) {
      case 'year':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'month':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'day':
        result.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        result.setMinutes(0, 0, 0);
        break;
      case 'minute':
        result.setSeconds(0, 0);
        break;
      case 'second':
        result.setMilliseconds(0);
        break;
    }

    return result;
  },

  /**
   * 获取日期的结束时间
   */
  endOf(date: Date, unit: string): Date {
    if (!this.isValid(date)) return new Date(NaN);

    const result = new Date(date);

    switch (unit) {
      case 'year':
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case 'month':
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case 'day':
        result.setHours(23, 59, 59, 999);
        break;
      case 'hour':
        result.setMinutes(59, 59, 999);
        break;
      case 'minute':
        result.setSeconds(59, 999);
        break;
      case 'second':
        result.setMilliseconds(999);
        break;
    }

    return result;
  },

  /**
   * 添加时间
   */
  add(date: Date, amount: number, unit: string): Date {
    if (!this.isValid(date)) return new Date(NaN);

    const result = new Date(date);

    switch (unit) {
      case 'year':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'month':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'day':
        result.setDate(result.getDate() + amount);
        break;
      case 'hour':
        result.setHours(result.getHours() + amount);
        break;
      case 'minute':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'second':
        result.setSeconds(result.getSeconds() + amount);
        break;
      case 'millisecond':
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
    }

    return result;
  },

  /**
   * 减少时间
   */
  subtract(date: Date, amount: number, unit: string): Date {
    return this.add(date, -amount, unit);
  },

  /**
   * 获取星期几 (0-6, 0为星期日)
   */
  getWeekday(date: Date): number {
    if (!this.isValid(date)) return -1;
    return date.getDay();
  },

  /**
   * 获取月份天数
   */
  getDaysInMonth(date: Date): number {
    if (!this.isValid(date)) return 0;
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  },

  /**
   * 获取月份名称
   */
  getMonthName(date: Date, locale = 'en'): string {
    if (!this.isValid(date)) return '';
    const month = date.getMonth();
    return locale === 'zh' ? monthNamesZh[month] || '' : monthNames[month] || '';
  },

  /**
   * 获取星期名称
   */
  getWeekdayName(date: Date, locale = 'en'): string {
    if (!this.isValid(date)) return '';
    const weekday = date.getDay();
    return locale === 'zh' ? weekdayNamesZh[weekday] || '' : weekdayNames[weekday] || '';
  },
};

/**
 * 获取默认格式
 */
export function getDefaultFormat(type: string): string {
  switch (type) {
    case 'date':
      return 'YYYY-MM-DD';
    case 'datetime':
      return 'YYYY-MM-DD HH:mm:ss';
    case 'daterange':
      return 'YYYY-MM-DD';
    case 'datetimerange':
      return 'YYYY-MM-DD HH:mm:ss';
    case 'month':
      return 'YYYY-MM';
    case 'year':
      return 'YYYY';
    default:
      return 'YYYY-MM-DD';
  }
}

/**
 * 获取默认占位符
 */
export function getDefaultPlaceholder(type: string, locale = 'zh'): string {
  const placeholders = {
    zh: {
      date: '选择日期',
      datetime: '选择日期时间',
      daterange: '开始日期',
      datetimerange: '开始日期时间',
      month: '选择月份',
      year: '选择年份',
    },
    en: {
      date: 'Select date',
      datetime: 'Select date time',
      daterange: 'Start date',
      datetimerange: 'Start date time',
      month: 'Select month',
      year: 'Select year',
    },
  };

  return (
    placeholders[locale as keyof typeof placeholders]?.[type as keyof typeof placeholders.zh] ||
    placeholders.zh[type as keyof typeof placeholders.zh]
  );
}

/**
 * 获取范围结束占位符
 */
export function getRangeEndPlaceholder(type: string, locale = 'zh'): string {
  const placeholders = {
    zh: {
      daterange: '结束日期',
      datetimerange: '结束日期时间',
    },
    en: {
      daterange: 'End date',
      datetimerange: 'End date time',
    },
  };

  return (
    placeholders[locale as keyof typeof placeholders]?.[type as keyof typeof placeholders.zh] ||
    placeholders.zh[type as keyof typeof placeholders.zh]
  );
}

/**
 * 生成日历数据
 */
export function generateCalendar(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const calendar: Date[][] = [];
  let week: Date[] = [];

  // 填充上个月的日期
  const prevMonth = new Date(year, month - 1, 0);
  const prevMonthDays = prevMonth.getDate();

  for (let i = firstWeekday - 1; i >= 0; i--) {
    week.push(new Date(year, month - 1, prevMonthDays - i));
  }

  // 填充当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));

    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  // 填充下个月的日期
  let nextDay = 1;
  while (week.length < 7) {
    week.push(new Date(year, month + 1, nextDay));
    nextDay++;
  }

  if (week.length > 0) {
    calendar.push(week);
  }

  return calendar;
}

/**
 * 获取年份列表
 */
export function getYearRange(center: number, range = 10): number[] {
  const start = center - Math.floor(range / 2);
  const years: number[] = [];

  for (let i = 0; i < range; i++) {
    years.push(start + i);
  }

  return years;
}

/**
 * 获取月份列表
 */
export function getMonthRange(): number[] {
  return Array.from({ length: 12 }, (_, i) => i);
}

/**
 * 获取小时列表
 */
export function getHourRange(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

/**
 * 获取分钟列表
 */
export function getMinuteRange(step = 1): number[] {
  const minutes: number[] = [];
  for (let i = 0; i < 60; i += step) {
    minutes.push(i);
  }
  return minutes;
}

/**
 * 获取秒钟列表
 */
export function getSecondRange(step = 1): number[] {
  const seconds: number[] = [];
  for (let i = 0; i < 60; i += step) {
    seconds.push(i);
  }
  return seconds;
}
