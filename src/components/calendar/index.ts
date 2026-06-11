import type { App } from 'vue';
import ExCalendar from './ExCalendar.vue';
import type { ExCalendarProps, ExCalendarEmits, ExCalendarExposed, CalendarEvent, CalendarDateCell, Holiday } from './types';

// 导出组件类型
export type { ExCalendarProps, ExCalendarEmits, ExCalendarExposed, CalendarEvent, CalendarDateCell, Holiday };
export type { CalendarMode } from './types';

// 导出组件
export { ExCalendar };

// 组件安装插件
export const ExCalendarPlugin = {
  install(app: App) {
    app.component('ExCalendar', ExCalendar);
  },
};

export default ExCalendarPlugin;
