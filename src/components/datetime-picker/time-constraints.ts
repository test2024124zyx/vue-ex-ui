import { normalizeMinuteStep, normalizeTimeUnit } from '../../utils/date';
import type { DateTimePickerEndpoint, DisabledTimeFn } from './types';

/** 编辑中未提交的原生输入也要参与确认校验，不能只检查上一次 change 的日期。 */
export function createTimeDraft(date: Date, values: number[], minuteStep: number): Date {
  const result = new Date(date);
  result.setHours(
    normalizeTimeUnit(values[0] ?? 0, 23),
    normalizeMinuteStep(values[1] ?? 0, minuteStep),
    normalizeTimeUnit(values[2] ?? 0, 59),
    0
  );
  return result;
}

/** 回调只接收日期副本，避免业务禁用逻辑意外修改内部确认值。 */
export function isDateTimeDisabled(
  date: Date,
  endpoint: DateTimePickerEndpoint,
  disabledTime?: DisabledTimeFn
): boolean {
  const constraints = disabledTime?.(new Date(date), endpoint);
  if (!constraints) return false;
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return Boolean(
    constraints.disabledHours?.().includes(hour) ||
    constraints.disabledMinutes?.(hour).includes(minute) ||
    constraints.disabledSeconds?.(hour, minute).includes(second)
  );
}
