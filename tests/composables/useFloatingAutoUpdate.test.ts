import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { useFloatingAutoUpdate } from '../../src/composables/useFloatingAutoUpdate';

afterEach(() => vi.unstubAllGlobals());

it('同轮 active 与元素变化只保留一组观察器，卸载清理全部观察器', async () => {
  const observers: { disconnect: ReturnType<typeof vi.fn> }[] = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor() {
        observers.push(this);
      }
    }
  );
  const update = vi.fn();
  const wrapper = mount(
    defineComponent({
      setup() {
        const element = ref<HTMLElement>();
        useFloatingAutoUpdate(ref(true), [element], [], update);
        return () => h('div', { ref: element });
      },
    })
  );
  await nextTick();
  await nextTick();
  wrapper.unmount();
  await nextTick();
  expect(observers.length).toBeGreaterThan(0);
  expect(observers.every(observer => observer.disconnect.mock.calls.length > 0)).toBe(true);
});
