/**
 * 日历模式
 */
export type CalendarMode = 'day' | 'week' | 'month' | 'year';

/**
 * 日历事件类型
 */
export interface CalendarEvent {
  /** 事件ID */
  id: string | number;
  /** 事件标题 */
  title: string;
  /** 事件日期 */
  date: Date | string;
  /** 事件类型 */
  type?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  /** 事件描述 */
  description?: string;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}

/**
 * 日历日期单元格数据
 */
export interface CalendarDateCell {
  /** 日期 */
  date: Date;
  /** 日期数字 */
  day: number;
  /** 是否当前月 */
  isCurrentMonth: boolean;
  /** 是否今天 */
  isToday: boolean;
  /** 是否选中 */
  isSelected: boolean;
  /** 是否禁用 */
  disabled: boolean;
  /** 该日期的事件列表 */
  events: CalendarEvent[];
  /** 签到状态 */
  checkedIn?: boolean;
  /** 农历日期 */
  lunar?: string;
  /** 节气 */
  solarTerm?: string;
  /** 节假日 */
  holiday?: string;
  /** 自定义数据 */
  data?: Record<string, unknown>;
}

/**
 * 节假日信息
 */
export interface Holiday {
  /** 节假日名称 */
  name: string;
  /** 节假日日期（月-日格式，如 "01-01" 表示1月1日） */
  date: string;
  /** 节假日类型 */
  type?: 'festival' | 'holiday' | 'custom';
}

/**
 * 日历组件属性接口
 */
export interface ExCalendarProps {
  /** 当前选中日期 */
  modelValue?: Date;
  /** 日历模式 */
  mode?: CalendarMode;
  /** 事件列表 */
  events?: CalendarEvent[];
  /** 禁用日期函数 */
  disabledDate?: (date: Date) => boolean;
  /** 是否显示今天按钮 */
  showToday?: boolean;
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 签到日期列表 */
  checkedInDates?: (Date | string)[];
  /** 是否显示农历 */
  showLunar?: boolean;
  /** 是否显示节气 */
  showSolarTerm?: boolean;
  /** 自定义节假日列表 */
  holidays?: Holiday[];
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 日历组件事件接口
 */
export interface ExCalendarEmits {
  /** 值改变事件 */
  'update:modelValue': [value: Date];
  /** 日期选择事件 */
  select: [date: Date, cell: CalendarDateCell];
  /** 月份改变事件 */
  'month-change': [year: number, month: number];
  /** 年份改变事件 */
  'year-change': [year: number];
  /** 模式更新事件（支持 v-model:mode） */
  'update:mode': [mode: CalendarMode];
  /** 模式改变事件 */
  'mode-change': [mode: CalendarMode];
  /** 日期单元格点击事件 */
  'date-click': [date: Date, cell: CalendarDateCell];
  /** 事件点击事件 */
  'event-click': [event: CalendarEvent, date: Date];
}

/**
 * 日历组件暴露的方法接口
 */
export interface ExCalendarExposed {
  /** 选择日期 */
  selectDate: (date: Date) => void;
  /** 跳转到今天 */
  goToday: () => void;
  /** 上一个月 */
  prevMonth: () => void;
  /** 下一个月 */
  nextMonth: () => void;
  /** 上一年 */
  prevYear: () => void;
  /** 下一年 */
  nextYear: () => void;
  /** 获取DOM元素 */
  getElement: () => HTMLDivElement | null;
}
