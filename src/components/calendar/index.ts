import ExCalendarComponent from './ExCalendar.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExCalendarProps,
  ExCalendarEmits,
  ExCalendarExposed,
  CalendarEvent,
  CalendarDateCell,
  Holiday,
} from './types';

// 导出组件类型
export type {
  ExCalendarProps,
  ExCalendarEmits,
  ExCalendarExposed,
  CalendarEvent,
  CalendarDateCell,
  Holiday,
};
export type { CalendarMode } from './types';

export const ExCalendar: InstallableComponent<typeof ExCalendarComponent> =
  withInstall(ExCalendarComponent);

export default ExCalendar;
