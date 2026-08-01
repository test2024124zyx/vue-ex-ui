import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
  getTheme,
  loadThemeFromStorage,
  onThemeChange,
  saveThemeToStorage,
  setTheme,
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
    const darkListeners = new Set<EventListener>();
    const createQuery = (matches: boolean, listeners: Set<EventListener>): MediaQueryList =>
      ({
        matches,
        media: '',
        onchange: null,
        addEventListener: (_type, listener) => listeners.add(listener as EventListener),
        removeEventListener: (_type, listener) => listeners.delete(listener as EventListener),
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      }) as MediaQueryList;

    vi.spyOn(window, 'matchMedia').mockImplementation(query => createQuery(true, darkListeners));

    const stop = useSystemTheme();
    expect(getTheme()).toBe('neon-blue');
    expect(darkListeners.size).toBe(1);

    stop();
    expect(darkListeners.size).toBe(0);
  });
});
