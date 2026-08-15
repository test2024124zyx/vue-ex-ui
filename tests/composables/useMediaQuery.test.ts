import { mount } from '@vue/test-utils';
import { createSSRApp, defineComponent, h, nextTick } from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  breakpointQueries,
  useMediaQuery,
  useMediaQueries,
} from '../../src/composables/useMediaQuery';

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('SSR 与客户端 hydration 的 setup 首帧都保留调用方初始值', async () => {
    const setupValues: boolean[] = [];
    const Probe = defineComponent({
      setup() {
        const matches = useMediaQuery('(min-width: 1px)', { initialValue: false });
        setupValues.push(matches.value);
        return () => h('span', String(matches.value));
      },
    });

    vi.stubGlobal('window', undefined);
    const serverHtml = await renderToString(createSSRApp(Probe));
    expect(serverHtml).toContain('false');

    vi.unstubAllGlobals();
    const mediaQuery = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue(mediaQuery);
    const host = document.createElement('div');
    host.innerHTML = serverHtml;
    document.body.append(host);
    const app = createSSRApp(Probe);

    app.mount(host);
    await nextTick();

    expect(setupValues).toEqual([false, false]);
    expect(matchMedia).toHaveBeenCalledOnce();
    expect(host.textContent).toBe('true');
    app.unmount();
    host.remove();
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

    await nextTick();
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

  it('公共断点查询与设计令牌和 Layout 运行时完全一致', () => {
    expect(breakpointQueries).toEqual({
      xs: '(max-width: 479px)',
      sm: '(min-width: 480px) and (max-width: 767px)',
      md: '(min-width: 768px) and (max-width: 1023px)',
      lg: '(min-width: 1024px) and (max-width: 1279px)',
      xl: '(min-width: 1280px) and (max-width: 1535px)',
      xxl: '(min-width: 1536px)',
      mobile: '(max-width: 767px)',
      tablet: '(min-width: 768px) and (max-width: 1279px)',
      desktop: '(min-width: 1280px)',
    });
  });
});
