import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { computed, h, nextTick, ref } from 'vue';
import { useCodeWindow } from '../../../src/components/code/use-code-window';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function withLayout(wrapped: boolean) {
  let resized = () => {};
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resized = callback;
      }
      observe() {}
      disconnect() {}
    }
  );
  let view!: ReturnType<typeof useCodeWindow>;
  const source = ref('row\n'.repeat(999) + 'end');
  let start = 0;
  vi.spyOn(document, 'createRange').mockImplementation(
    () =>
      ({
        setStart: (_node: Node, offset: number) => {
          start = offset;
        },
        setEnd: () => {},
        getClientRects: () => [{ top: 10 + Math.floor(start / 4) * 40 }],
      }) as unknown as Range
  );
  const wrapper = mount(
    {
      setup() {
        const scroller = ref<HTMLDivElement>();
        const measurement = ref<HTMLDivElement>();
        view = useCodeWindow(
          source,
          computed(() => source.value.split('\n').length),
          ref(wrapped),
          scroller,
          measurement
        );
        return () =>
          h('div', { ref: scroller }, [
            h(
              'div',
              {
                ref: measurement,
                class: 'measure',
                style: { lineHeight: '20px', top: '10px', left: '30px' },
              },
              `${source.value}\u200b`
            ),
            h('textarea', { value: source.value }),
          ]);
      },
    },
    { attachTo: document.body }
  );
  const scroller = wrapper.get<HTMLDivElement>('div').element;
  const measurement = wrapper.get<HTMLDivElement>('.measure').element;
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 200 });
  Object.defineProperty(measurement, 'offsetWidth', { configurable: true, value: 420 });
  vi.spyOn(measurement, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    height: 40_000,
  } as DOMRect);
  resized();
  return { view, scroller, source, editor: wrapper.get('textarea').element };
}

describe('代码长文件视口的测量与选择', () => {
  it('无换行时随滚动移入末尾窗口并保留横向宽度', async () => {
    vi.useFakeTimers();
    const { view, scroller, source } = withLayout(false);
    expect(view.start.value).toBe(0);
    expect(view.width.value).toBe('450px');
    scroller.scrollTop = 19_820;
    view.onScroll();
    await vi.advanceTimersByTimeAsync(20);
    expect(view.start.value).toBeGreaterThan(950);
    expect(view.end.value).toBe(1000);
    expect(view.bottom.value).toBe('0px');
    source.value = '仅一行';
    await nextTick();
    expect(view.active.value).toBe(false);
    expect(view.start.value).toBe(0);
    expect(view.end.value).toBe(1);
  });

  it('软换行测量计入真实行高，并能揭示反向选择的光标', () => {
    const { view, scroller, editor } = withLayout(true);
    expect(view.end.value).toBe(12);
    expect(view.width.value).toBeUndefined();
    editor.focus();
    editor.setSelectionRange(3980, 3990, 'backward');
    view.revealCaret(editor);
    expect(scroller.scrollTop).toBeGreaterThan(39_000);
    expect(view.start.value).toBeGreaterThan(950);
    editor.setSelectionRange(0, 0);
    view.revealCaret(editor);
    expect(scroller.scrollTop).toBe(10);
    expect(view.start.value).toBe(0);
  });
});
