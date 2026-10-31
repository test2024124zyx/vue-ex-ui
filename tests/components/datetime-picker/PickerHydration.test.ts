import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString, type SSRContext } from '@vue/server-renderer';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  vi.restoreAllMocks();
});

describe('选择器确认值的 SSR 水合', () => {
  it.each(['week', 'time'] as const)(
    '%s 范围在服务端和客户端保持确认值及 ARIA 关联',
    async kind => {
      // 不引入 Test Utils 的 Transition 替身，使用完整的原生 Vue 水合链路。
      const render = () =>
        kind === 'week'
          ? h(ExDateTimePicker, {
              type: 'weekrange',
              modelValue: [new Date(2021, 0, 1), new Date(2021, 0, 7)],
              ariaLabel: '周范围',
            })
          : h(ExTimePicker, {
              range: true,
              rangeValue: ['09:00', '18:00'],
              format: 'HH:mm',
              ariaLabel: '预约范围',
            });
      const context: SSRContext = {};
      const html = await renderToString(createSSRApp({ render }), context);
      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);
      const previousNodes = new Set(document.body.childNodes);
      document.body.insertAdjacentHTML('beforeend', context.teleports?.body ?? '');
      const teleportNodes = Array.from(document.body.childNodes).filter(
        node => !previousNodes.has(node)
      );
      const control = container.querySelector('[role="combobox"]')!;
      const beforeControls = control.getAttribute('aria-controls');
      const readValue = () =>
        kind === 'week'
          ? container.querySelector('input')!.value
          : container.querySelector('.ex-time-picker__text')!.textContent;
      const beforeValue = readValue();
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const app = createSSRApp({ render });
      app.mount(container);
      cleanups.push(() => {
        app.unmount();
        container.remove();
        teleportNodes.forEach(node => node.parentNode?.removeChild(node));
      });
      await nextTick();
      expect(readValue()).toBe(beforeValue);
      expect(readValue()).toContain(kind === 'week' ? '2020-W53' : '09:00');
      expect(readValue()).toContain(kind === 'week' ? '2021-W01' : '18:00');
      expect(control.getAttribute('aria-controls')).toBe(beforeControls);
      expect(error.mock.calls.flat().some(value => String(value).includes('Hydration'))).toBe(
        false
      );
    }
  );
});
