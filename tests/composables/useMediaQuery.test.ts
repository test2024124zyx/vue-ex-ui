import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { useMediaQuery, useMediaQueries } from '../../src/composables/useMediaQuery';

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('挂载时读取匹配状态、响应变化并在卸载时解绑', async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const mediaQuery = {
      matches: true,
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener)
      ),
      removeEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener)
      ),
    } as unknown as MediaQueryList;
    vi.spyOn(window, 'matchMedia').mockReturnValue(mediaQuery);

    const Probe = defineComponent({
      setup() {
        const matches = useMediaQuery('(min-width: 1px)');
        return () => h('span', String(matches.value));
      },
    });
    const wrapper = mount(Probe);

    expect(wrapper.text()).toBe('true');
    for (const listener of listeners) listener({ matches: false } as MediaQueryListEvent);
    await nextTick();
    expect(wrapper.text()).toBe('false');

    wrapper.unmount();
    expect(listeners.size).toBe(0);
    expect(mediaQuery.removeEventListener).toHaveBeenCalledOnce();
  });

  it('浏览器拒绝媒体查询时保留 SSR 初始值且不输出控制台噪声', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(() => {
      throw new DOMException('unsupported');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const Probe = defineComponent({
      setup() {
        const matches = useMediaQuery('(future-feature)', { initialValue: true });
        return () => h('span', String(matches.value));
      },
    });

    expect(mount(Probe).text()).toBe('true');
    expect(warn).not.toHaveBeenCalled();
  });

  it('拒绝空查询并确保多查询结果键完整', () => {
    expect(() => useMediaQuery('   ')).toThrow(TypeError);

    const Probe = defineComponent({
      setup() {
        const queries = useMediaQueries({
          mobile: '(max-width: 1px)',
          desktop: '(min-width: 2px)',
        });
        expect(Object.keys(queries)).toEqual(['mobile', 'desktop']);
        return () => null;
      },
    });

    mount(Probe);
  });
});
