import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
  getPreferredSystemTheme,
  getTheme,
  loadThemeFromStorage,
  onThemeChange,
  observeSystemTheme,
  saveThemeToStorage,
  setTheme,
  toggleTheme,
  usePersistedTheme,
  useSystemTheme,
  VALID_THEMES,
} from '../../src/composables/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('color-scheme');
    setTheme('neon-blue');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('仅暴露赛博暗色和赛博亮色两个全局主题', () => {
    expect(VALID_THEMES).toEqual(['neon-blue', 'light']);
  });

  it('导入主题模块不会覆盖宿主根节点已有的主题契约', async () => {
    document.documentElement.setAttribute('data-theme', 'host-brand');
    document.documentElement.style.colorScheme = 'normal';
    document.documentElement.classList.remove('ex-theme-loaded');
    vi.resetModules();

    await import('../../src/composables/useTheme');

    expect(document.documentElement.dataset.theme).toBe('host-brand');
    expect(document.documentElement.style.colorScheme).toBe('normal');
    expect(document.documentElement.classList.contains('ex-theme-loaded')).toBe(false);
  });

  it('同步响应式状态、DOM、颜色模式与统一变化事件', () => {
    const changes: string[] = [];
    const events: CustomEvent[] = [];
    const stop = onThemeChange(theme => changes.push(theme));
    const listener = (event: Event) => events.push(event as CustomEvent);
    document.addEventListener('ex-theme-change', listener);

    setTheme('light');

    expect(getTheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(changes).toEqual(['light']);
    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toMatchObject({ oldTheme: 'neon-blue', newTheme: 'light' });

    stop();
    document.removeEventListener('ex-theme-change', listener);
  });

  it('重复设置同一主题只修复 DOM，不重复触发变化通知', () => {
    setTheme('light');
    document.documentElement.removeAttribute('data-theme');
    const callback = vi.fn();
    const stop = onThemeChange(callback);

    setTheme('light');

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(callback).not.toHaveBeenCalled();
    stop();
  });

  it('拒绝运行时传入的未知主题', () => {
    expect(() => setTheme('unknown' as never)).toThrow(TypeError);
    expect(getTheme()).toBe('neon-blue');
  });

  it('存储不可用时读取与写入均安全降级', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied');
    });

    expect(() => saveThemeToStorage('light')).not.toThrow();
    expect(loadThemeFromStorage()).toBeNull();
  });

  it('持久化监听随组件作用域销毁，不留下全局观察器', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const wrapper = mount({
      setup() {
        usePersistedTheme();
        return () => null;
      },
    });

    setTheme('light');
    await nextTick();
    expect(write).toHaveBeenLastCalledWith('ex-ui-theme', 'light');

    wrapper.unmount();
    write.mockClear();
    setTheme('light');
    await nextTick();
    expect(write).not.toHaveBeenCalled();
  });

  it('系统主题监听会应用初始偏好并完整解绑', () => {
    type MediaQueryListener = (event: MediaQueryListEvent) => void;
    const darkListeners = new Set<MediaQueryListener>();
    const createQuery = (matches: boolean, listeners: Set<MediaQueryListener>): MediaQueryList =>
      ({
        matches,
        media: '',
        onchange: null,
        addEventListener: (_type: 'change', listener: MediaQueryListener) =>
          listeners.add(listener),
        removeEventListener: (_type: 'change', listener: MediaQueryListener) =>
          listeners.delete(listener),
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      }) as MediaQueryList;

    vi.spyOn(window, 'matchMedia').mockImplementation(_query => createQuery(true, darkListeners));

    const stop = useSystemTheme();
    expect(getTheme()).toBe('neon-blue');
    expect(darkListeners.size).toBe(1);

    stop();
    expect(darkListeners.size).toBe(0);
  });

  it('主题切换支持自定义循环列表并拒绝空列表和未知主题', () => {
    toggleTheme([]);
    expect(getTheme()).toBe('neon-blue');
    toggleTheme(['light']);
    expect(getTheme()).toBe('light');
    toggleTheme(['light', 'neon-blue']);
    expect(getTheme()).toBe('neon-blue');
    expect(() => toggleTheme(['unknown' as never])).toThrow(TypeError);
  });

  it('主题回调快照允许回调在执行时取消自身', () => {
    const calls: string[] = [];
    let stopSelf: () => void = () => undefined;
    stopSelf = onThemeChange(theme => {
      calls.push(`self:${theme}`);
      stopSelf();
    });
    onThemeChange(theme => calls.push(`other:${theme}`));

    setTheme('light');
    setTheme('neon-blue');
    expect(calls).toEqual(['self:light', 'other:light', 'other:neon-blue']);
  });

  it('系统主题偏好在无 API、非暗色和异常 API 时安全回退', () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: undefined });
    expect(getPreferredSystemTheme()).toBe('neon-blue');
    const callback = vi.fn();
    expect(observeSystemTheme(callback)).toBeTypeOf('function');
    expect(callback).toHaveBeenCalledWith('neon-blue');

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    expect(getPreferredSystemTheme()).toBe('light');
    const stop = observeSystemTheme(callback, false);
    stop();

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('denied');
      }),
    });
    expect(getPreferredSystemTheme()).toBe('neon-blue');
    expect(observeSystemTheme(callback)).toBeTypeOf('function');
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
  });

  it('系统主题监听应该响应变化事件且重复停止无副作用', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    const query = {
      matches: true,
      addEventListener: vi.fn((_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listener = callback;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    vi.spyOn(window, 'matchMedia').mockReturnValue(query);
    const callback = vi.fn();
    const stop = observeSystemTheme(callback);
    expect(callback).toHaveBeenCalledWith('neon-blue');
    listener?.({} as MediaQueryListEvent);
    expect(callback).toHaveBeenCalledTimes(2);
    stop();
    stop();
    expect(query.removeEventListener).toHaveBeenCalledOnce();
  });

  it('存储主题会忽略无效值并保存有效值', () => {
    saveThemeToStorage('light');
    expect(loadThemeFromStorage()).toBe('light');
    localStorage.setItem('ex-ui-theme', 'unknown');
    expect(loadThemeFromStorage()).toBeNull();
    saveThemeToStorage('unknown' as never);
    expect(localStorage.getItem('ex-ui-theme')).toBe('unknown');
  });
});
