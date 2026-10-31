import { createApp, h, nextTick, ref } from 'vue';
import { ExConfigProvider, ExDateTimePicker, ExTimePicker } from '../../src';
import type { DateTimePickerType, DateTimePickerValue, TimePickerRange } from '../../src';
import { formatDate } from '../../src/utils/date';
import '../../src/style-full';

const params = new URLSearchParams(location.search);
const type = (params.get('type') || 'month') as DateTimePickerType;
const theme = params.get('theme') === 'light' ? 'light' : 'neon-blue';
document.documentElement.dataset.theme = theme;
const date = ref<DateTimePickerValue>(
  type.startsWith('week') ? new Date(2021, 0, 1) : new Date(2026, 9, 29, 9)
);
const timeRange = ref<TimePickerRange | null>(null);
const dateText = () => {
  const value = date.value;
  const format = (item: Date) => formatDate(item, 'YYYY-MM-DD HH:mm:ss');
  return Array.isArray(value) ? value.map(format).join(' / ') : value ? format(value) : '';
};

const app = createApp({
  render: () =>
    h(ExConfigProvider, { theme, locale: 'zh-CN', animation: false }, () =>
      h(
        'main',
        {
          class: 'ex-app',
          style: {
            padding: 'var(--ex-spacing-4)',
            minHeight: '100vh',
            boxSizing: 'border-box',
          },
        },
        [
          h('h1', '日期与时间验收'),
          h('section', { style: { marginBlock: 'var(--ex-spacing-4)' } }, [
            h(ExDateTimePicker, {
              modelValue: date.value,
              type,
              ariaLabel: '周期',
              disabledTime: () => ({ disabledHours: () => [9] }),
              'onUpdate:modelValue': value => (date.value = value),
            }),
            h('output', { id: 'date-value', style: { display: 'block' } }, dateText()),
          ]),
          h('section', { style: { marginBlock: 'var(--ex-spacing-4)' } }, [
            h(ExTimePicker, {
              range: true,
              rangeValue: timeRange.value,
              format: 'HH:mm',
              minuteStep: 15,
              ariaLabel: '时间范围',
              'onUpdate:rangeValue': value => (timeRange.value = value),
            }),
            h('output', { id: 'time-range-value' }, JSON.stringify(timeRange.value)),
          ]),
          h('button', { type: 'button' }, '页面后续操作'),
        ]
      )
    ),
});
app.mount('#app');
void nextTick(() => {
  document.documentElement.dataset.ready = 'true';
});
window.addEventListener('pagehide', () => app.unmount(), { once: true });
