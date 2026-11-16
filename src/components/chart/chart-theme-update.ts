import { equalValueSnapshot } from '../../utils/value-snapshot';
import { deepMerge } from '../../utils';
import type { ChartOption } from './types';

type Style = Record<string, unknown>;

export interface ChartThemeStyle {
  base: Style;
  controls: Style;
}

const asStyle = (value: unknown): Style =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Style) : {};
const asComponents = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value == null ? [] : [value];
const axes = ['xAxis', 'yAxis', 'radiusAxis', 'angleAxis', 'singleAxis', 'parallelAxis'] as const;
const axisKeys = new Set<string>(axes);
const themedComponents = ['title', ...axes, 'series', 'legend', 'tooltip', 'toolbox', 'dataZoom'];

/** 跟踪实际应用的显式配置，合并顺序与 ECharts 的 id、name、位置优先级一致。 */
export function mergeChartThemeOptions(
  previous: ChartOption,
  option: ChartOption,
  replaceMerge: string | string[] | undefined
): ChartOption {
  const replaced = new Set(typeof replaceMerge === 'string' ? [replaceMerge] : replaceMerge);
  const result = { ...previous, ...option };
  if (option.textStyle && typeof option.textStyle === 'object') {
    result.textStyle = deepMerge(asStyle(previous.textStyle), asStyle(option.textStyle));
  }
  for (const key of themedComponents) {
    const replace = replaced.has(key);
    if (!replace && !Object.prototype.hasOwnProperty.call(option, key)) continue;
    const existing = asComponents(previous[key]);
    const unmatched = asComponents(option[key]).filter(
      (value): value is Style =>
        value !== null && typeof value === 'object' && !Array.isArray(value)
    );
    const slots = existing.map(value => (replace ? null : value));
    const matched = new Set<number>();
    const place = (value: Style, index: number) => {
      slots[index] = deepMerge(asStyle(slots[index]), value);
      matched.add(index);
    };
    const pending = unmatched
      .filter(value => {
        if (value.id == null) return true;
        const index = existing.findIndex(
          item => asStyle(item).id != null && String(asStyle(item).id) === String(value.id)
        );
        if (index < 0) return true;
        slots[index] = existing[index];
        place(value, index);
        return false;
      })
      .filter(value => {
        if (replace || value.name == null) return true;
        const index = slots.findIndex((item, index) => {
          const fields = asStyle(item);
          return (
            !matched.has(index) &&
            fields.name != null &&
            String(fields.name) === String(value.name) &&
            (fields.id == null || value.id == null)
          );
        });
        if (index < 0) return true;
        place(value, index);
        return false;
      });
    for (const value of pending) {
      const index = slots.findIndex(
        (item, index) => !matched.has(index) && (item == null || value.id == null)
      );
      place(value, index < 0 ? slots.length : index);
    }
    result[key] = slots;
  }
  return result;
}

function componentStyle(theme: ChartThemeStyle, key: string, option: Style, index: number): Style {
  if (axisKeys.has(key)) return asStyle(theme.base[`${option.type ?? 'value'}Axis`]);
  if (key === 'series') return asStyle(theme.base[String(option.type ?? '')]);
  const control = theme.controls[key];
  const component = Array.isArray(control) ? control[index] : control;
  return { ...asStyle(theme.base[key]), ...asStyle(component) };
}

/** 只替换仍采用上一主题默认值的样式，业务配置和运行时交互状态由 ECharts 保留。 */
function diffDefaults(current: Style, previous: Style, next: Style, explicit: Style): Style {
  const patch: Style = {};
  for (const [key, nextValue] of Object.entries(next)) {
    const oldValue = previous[key];
    const currentValue = current[key];
    if (oldValue === undefined || equalValueSnapshot(oldValue, nextValue)) continue;
    if (nextValue && typeof nextValue === 'object' && !Array.isArray(nextValue)) {
      const child = diffDefaults(
        asStyle(currentValue),
        asStyle(oldValue),
        asStyle(nextValue),
        asStyle(explicit[key])
      );
      if (Object.keys(child).length) patch[key] = child;
    } else if (
      !Object.prototype.hasOwnProperty.call(explicit, key) &&
      equalValueSnapshot(currentValue, oldValue)
    ) {
      patch[key] = nextValue;
    }
  }
  return patch;
}

export function createChartThemePatch(
  current: ChartOption,
  previous: ChartThemeStyle,
  next: ChartThemeStyle,
  explicit: ChartOption
): ChartOption {
  const root = ({ color, textStyle, backgroundColor }: Style): Style => ({
    color,
    textStyle,
    backgroundColor,
  });
  const patch: ChartOption = diffDefaults(current, root(previous.base), root(next.base), explicit);
  for (const key of themedComponents) {
    const components = asComponents(current[key]);
    const declared = asComponents(explicit[key]);
    let changed = false;
    const updates = components.map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const fields = asStyle(item);
      const business =
        fields.id === undefined
          ? declared[index]
          : declared.find(value => asStyle(value).id === fields.id);
      const update = diffDefaults(
        fields,
        componentStyle(previous, key, fields, index),
        componentStyle(next, key, fields, index),
        asStyle(business)
      );
      changed ||= Object.keys(update).length > 0;
      return fields.id === undefined ? update : { id: fields.id, ...update };
    });
    if (changed) patch[key] = Array.isArray(current[key]) ? updates : updates[0];
  }
  return patch;
}
