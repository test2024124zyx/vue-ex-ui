import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import ExLayout from '../../src/components/layout/ExLayout.vue';
import ExHeader from '../../src/components/layout/ExHeader.vue';
import ExSider from '../../src/components/layout/ExSider.vue';
import ExContent from '../../src/components/layout/ExContent.vue';
import ExFooter from '../../src/components/layout/ExFooter.vue';
import ExContainer from '../../src/components/layout/ExContainer.vue';
import {
  ExContainer as InstallableContainer,
  ExContent as InstallableContent,
  ExFooter as InstallableFooter,
  ExHeader as InstallableHeader,
  ExLayout as InstallableLayout,
  ExSider as InstallableSider,
} from '../../src/components/layout';
import { setLocale } from '../../src/locale';

class MediaQueryListMock {
  matches: boolean;
  readonly media: string;
  readonly listeners = new Set<(event: MediaQueryListEvent) => void>();
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => unknown) | null = null;

  constructor(media: string, matches: boolean) {
    this.media = media;
    this.matches = matches;
  }

  addEventListener(_type: 'change', listener: (event: MediaQueryListEvent) => void): void {
    this.listeners.add(listener);
  }

  removeEventListener(_type: 'change', listener: (event: MediaQueryListEvent) => void): void {
    this.listeners.delete(listener);
  }

  addListener(listener: (event: MediaQueryListEvent) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (event: MediaQueryListEvent) => void): void {
    this.listeners.delete(listener);
  }

  dispatch(matches: boolean): void {
    this.matches = matches;
    const event = { matches, media: this.media } as MediaQueryListEvent;
    for (const listener of this.listeners) listener(event);
  }

  dispatchEvent(): boolean {
    return true;
  }
}

describe('Layout v2', () => {
  let initialMediaMatches = true;
  let mediaQueries: MediaQueryListMock[];

  beforeEach(() => {
    setLocale('en-US');
    initialMediaMatches = true;
    mediaQueries = [];
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => {
        const mediaQuery = new MediaQueryListMock(query, initialMediaMatches);
        mediaQueries.push(mediaQuery);
        return mediaQuery;
      })
    );
  });

  afterEach(() => {
    document.body.replaceChildren();
    setLocale('en-US');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('ExLayout', () => {
    it('使用无额外地标语义的根容器并透传原生属性', () => {
      const wrapper = mount(ExLayout, {
        attrs: {
          id: 'application-layout',
          class: 'custom-layout',
          style: 'min-height: 20rem',
          'aria-label': 'Application shell',
        },
        slots: { default: 'Content' },
      });

      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.classes()).toContain('custom-layout');
      expect(wrapper.attributes('style')).toContain('min-height: 20rem');
      expect(wrapper.attributes('aria-label')).toBe('Application shell');
      expect(wrapper.text()).toBe('Content');
    });

    it('无 Sider 时自动使用垂直方向', () => {
      const wrapper = mount(ExLayout);

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['ex-layout', 'ex-layout--auto', 'ex-layout--vertical'])
      );
      expect(wrapper.classes()).not.toContain('ex-layout--has-sider');
    });

    it('直系 Sider 注册后自动切换水平方向并在卸载后恢复', async () => {
      const showSider = ref(true);
      const wrapper = mount(ExLayout, {
        slots: {
          default: () => [showSider.value ? h(ExSider) : null, h('div', { class: 'page' })],
        },
      });
      await nextTick();

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['ex-layout--horizontal', 'ex-layout--has-sider'])
      );

      showSider.value = false;
      await nextTick();
      expect(wrapper.classes()).toContain('ex-layout--vertical');
      expect(wrapper.classes()).not.toContain('ex-layout--has-sider');

      wrapper.unmount();
    });

    it('显式方向优先于自动 Sider 推断', async () => {
      const wrapper = mount(ExLayout, {
        props: { direction: 'vertical' },
        slots: { default: () => h(ExSider) },
      });
      await nextTick();

      expect(wrapper.classes()).toContain('ex-layout--vertical');
      expect(wrapper.classes()).not.toContain('ex-layout--auto');
      expect(wrapper.classes()).toContain('ex-layout--has-sider');
    });

    it('删除冲突的 hasSider 与重复 class/style 运行时 props', () => {
      const runtimeProps = (ExLayout as unknown as { props: Record<string, unknown> }).props;

      expect(runtimeProps).not.toHaveProperty('hasSider');
      expect(runtimeProps).not.toHaveProperty('class');
      expect(runtimeProps).not.toHaveProperty('style');
    });

    it('暴露根元素快照', () => {
      const wrapper = mount(ExLayout);
      const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };

      expect(exposed.getElement()).toBe(wrapper.element);
    });

    it('复合组件使用无重复前缀的稳定成员名', () => {
      expect(InstallableLayout.Header).toBe(InstallableHeader);
      expect(InstallableLayout.Sider).toBe(InstallableSider);
      expect(InstallableLayout.Content).toBe(InstallableContent);
      expect(InstallableLayout.Footer).toBe(InstallableFooter);
      expect(InstallableLayout.Container).toBe(InstallableContainer);
      expect(InstallableLayout).not.toHaveProperty('ExHeader');
    });
  });

  describe('ExHeader 与 ExFooter', () => {
    it.each([
      [ExHeader, 'HEADER', 'ex-header'],
      [ExFooter, 'FOOTER', 'ex-footer'],
    ] as const)('%s 使用原生语义且不重复声明 role', (component, tag, className) => {
      const wrapper = mount(component, { slots: { default: 'Content' } });

      expect(wrapper.element.tagName).toBe(tag);
      expect(wrapper.classes()).toContain(className);
      expect(wrapper.attributes('role')).toBeUndefined();
      expect(wrapper.text()).toBe('Content');
    });

    it.each([
      [ExHeader, '--ex-header-height'],
      [ExFooter, '--ex-footer-height'],
    ] as const)('数字和字符串高度生成稳定 CSS 变量', async (component, variable) => {
      const wrapper = mount(component, { props: { height: 80 } });
      expect(wrapper.element.style.getPropertyValue(variable)).toBe('80px');

      await wrapper.setProps({ height: '5rem' });
      expect(wrapper.element.style.getPropertyValue(variable)).toBe('5rem');

      await wrapper.setProps({ height: Number.NaN });
      expect(wrapper.element.style.getPropertyValue(variable)).toBe('64px');
    });

    it.each([
      [ExHeader, 'ex-header'],
      [ExFooter, 'ex-footer'],
    ] as const)('具名插槽存在时默认插槽作为中间内容保留', (component, className) => {
      const wrapper = mount(component, {
        slots: {
          left: 'Left',
          default: 'Default center',
          right: 'Right',
        },
      });

      expect(wrapper.get(`.${className}__left`).text()).toBe('Left');
      expect(wrapper.get(`.${className}__center`).text()).toBe('Default center');
      expect(wrapper.get(`.${className}__right`).text()).toBe('Right');
    });

    it.each([
      [ExHeader, 'ex-header'],
      [ExFooter, 'ex-footer'],
    ] as const)('center 插槽优先于默认插槽且不会重复渲染', (component, className) => {
      const wrapper = mount(component, {
        slots: {
          left: 'Left',
          center: 'Named center',
          default: 'Fallback center',
        },
      });

      expect(wrapper.get(`.${className}__center`).text()).toBe('Named center');
      expect(wrapper.text()).not.toContain('Fallback center');
    });

    it('Header 的固定、模糊和显式霓虹状态真实映射到样式类', () => {
      const wrapper = mount(ExHeader, {
        props: { fixed: true, blur: true, neonBorder: true },
      });

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['ex-header--fixed', 'ex-header--blur', 'ex-header--neon-border'])
      );
    });

    it('显式关闭霓虹效果会覆盖全局默认值', () => {
      const header = mount(ExHeader, { props: { neonBorder: false } });
      const footer = mount(ExFooter, { props: { neonBorder: false } });

      expect(header.classes()).not.toContain('ex-header--neon-border');
      expect(footer.classes()).not.toContain('ex-footer--neon-border');
    });

    it('Footer 透传原生 class/style 并暴露元素', () => {
      const wrapper = mount(ExFooter, {
        attrs: { class: 'custom-footer', style: 'color: red' },
      });
      const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };

      expect(wrapper.classes()).toContain('custom-footer');
      expect(wrapper.attributes('style')).toContain('color: red');
      expect(exposed.getElement()).toBe(wrapper.element);
    });
  });

  describe('ExSider', () => {
    it('渲染带名称的 aside，并将 attrs 绑定到真实侧栏而非 Teleport', () => {
      const wrapper = mount(ExSider, {
        attrs: { id: 'navigation', class: 'custom-sider', style: 'color: red' },
        props: { ariaLabel: 'Primary navigation' },
        slots: { default: 'Navigation' },
      });

      expect(wrapper.get('aside').attributes('id')).toBe('navigation');
      expect(wrapper.get('aside').classes()).toContain('custom-sider');
      expect(wrapper.get('aside').attributes('style')).toContain('color: red');
      expect(wrapper.get('aside').attributes('aria-label')).toBe('Primary navigation');
    });

    it('非受控模式提交可见状态并发出带来源的事件', async () => {
      const wrapper = mount(ExSider, { props: { collapsible: true } });
      const trigger = wrapper.get('.ex-sider__trigger');

      expect(trigger.element.tagName).toBe('BUTTON');
      expect(trigger.attributes('type')).toBe('button');
      expect(trigger.attributes('aria-expanded')).toBe('true');
      await trigger.trigger('click');

      expect(wrapper.get('aside').classes()).toContain('ex-sider--collapsed');
      expect(wrapper.emitted('update:collapsed')).toEqual([[true]]);
      expect(wrapper.emitted('collapse')).toEqual([[true, 'trigger']]);
      expect(trigger.attributes('aria-expanded')).toBe('false');
    });

    it('受控模式只请求变更，外部确认前不提前改写可见状态', async () => {
      const wrapper = mount(ExSider, {
        props: { collapsible: true, collapsed: false },
      });

      await wrapper.get('.ex-sider__trigger').trigger('click');
      expect(wrapper.get('aside').classes()).not.toContain('ex-sider--collapsed');
      expect(wrapper.emitted('update:collapsed')).toEqual([[true]]);

      await wrapper.setProps({ collapsed: true });
      expect(wrapper.get('aside').classes()).toContain('ex-sider--collapsed');
    });

    it('defaultCollapsed 初始化非受控状态且支持暴露 toggle', async () => {
      const wrapper = mount(ExSider, {
        props: { defaultCollapsed: true, collapsible: true },
      });
      const exposed = wrapper.vm as unknown as {
        toggle: () => void;
        getElement: () => HTMLElement | null;
      };

      expect(wrapper.get('aside').classes()).toContain('ex-sider--collapsed');
      exposed.toggle();
      await nextTick();
      expect(wrapper.get('aside').classes()).not.toContain('ex-sider--collapsed');
      expect(exposed.getElement()).toBe(wrapper.get('aside').element);
    });

    it('宽度、收起宽度和动画时长通过 CSS 变量更新', async () => {
      const wrapper = mount(ExSider, {
        props: {
          width: 300,
          collapsedWidth: '4rem',
          transitionDuration: 0,
          collapsible: true,
        },
      });
      const aside = wrapper.get('aside').element as HTMLElement;

      expect(aside.style.getPropertyValue('--ex-sider-width')).toBe('300px');
      expect(aside.style.getPropertyValue('--ex-sider-transition-duration')).toBe('0ms');
      await wrapper.get('.ex-sider__trigger').trigger('click');
      expect(aside.style.getPropertyValue('--ex-sider-width')).toBe('4rem');
    });

    it('非法尺寸和动画值回退到各自默认契约', () => {
      const wrapper = mount(ExSider, {
        props: {
          width: -1,
          collapsedWidth: '-2rem',
          defaultCollapsed: true,
          transitionDuration: Number.NaN,
        },
      });
      const aside = wrapper.get('aside').element as HTMLElement;

      expect(aside.style.getPropertyValue('--ex-sider-width')).toBe('80px');
      expect(aside.style.getPropertyValue('--ex-sider-transition-duration')).toBe('300ms');
    });

    it('零收起宽度保留可访问的展开触发器', () => {
      const wrapper = mount(ExSider, {
        props: { collapsedWidth: 0, defaultCollapsed: true, collapsible: true },
      });

      expect(wrapper.get('aside').classes()).toContain('ex-sider--zero-width');
      expect(wrapper.get('.ex-sider__trigger').attributes('aria-label')).toBe('Expand sidebar');
    });

    it('右侧位置、顶部触发器和表面效果映射为互不冲突的状态类', () => {
      const wrapper = mount(ExSider, {
        props: {
          position: 'right',
          trigger: 'top',
          collapsible: true,
          neonBorder: true,
          blur: true,
        },
      });

      expect(wrapper.get('aside').classes()).toEqual(
        expect.arrayContaining([
          'ex-sider--right',
          'ex-sider--trigger-top',
          'ex-sider--neon-border',
          'ex-sider--blur',
        ])
      );
      expect(wrapper.get('.ex-sider__trigger').classes()).toContain('ex-sider__trigger--top');
    });

    it('trigger=null 不渲染内置触发器，自定义触发器接收完整状态', () => {
      const hidden = mount(ExSider, {
        props: { collapsible: true, trigger: null },
      });
      expect(hidden.find('.ex-sider__trigger').exists()).toBe(false);

      const custom = mount(ExSider, {
        props: { collapsible: true, defaultCollapsed: true },
        slots: {
          trigger: ({ collapsed, broken }) => `${String(collapsed)}:${String(broken)}`,
        },
      });
      expect(custom.get('.ex-sider__trigger').text()).toBe('true:false');
    });

    it('键盘原生按钮触发一次切换', async () => {
      const wrapper = mount(ExSider, { props: { collapsible: true } });
      await wrapper.get('.ex-sider__trigger').trigger('keydown', { key: 'Enter' });
      await wrapper.get('.ex-sider__trigger').trigger('click');

      expect(wrapper.emitted('update:collapsed')).toEqual([[true]]);
    });

    it('使用设计令牌阈值建立 min-width 查询，小于断点时自动收起', async () => {
      initialMediaMatches = false;
      const wrapper = mount(ExSider, {
        props: { breakpoint: 'md', collapsible: true },
      });
      await nextTick();

      expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
      expect(wrapper.get('aside').classes()).toContain('ex-sider--broken');
      expect(wrapper.get('aside').classes()).toContain('ex-sider--collapsed');
      expect(wrapper.emitted('breakpoint')).toEqual([[true]]);
      expect(wrapper.emitted('collapse')).toEqual([[true, 'responsive']]);

      mediaQueries[0]?.dispatch(true);
      await nextTick();
      expect(wrapper.get('aside').classes()).not.toContain('ex-sider--broken');
      expect(wrapper.emitted('breakpoint')).toEqual([[true], [false]]);
      mediaQueries[0]?.dispatch(true);
      await nextTick();
      expect(wrapper.emitted('breakpoint')).toEqual([[true], [false]]);
      wrapper.unmount();
      expect(mediaQueries[0]?.listeners.size).toBe(0);
    });

    it('受控展开侧栏在窄屏显示遮罩，遮罩请求关闭但不篡改状态', async () => {
      initialMediaMatches = false;
      const wrapper = mount(ExSider, {
        attachTo: document.body,
        props: { breakpoint: 'lg', collapsed: false, collapsible: true },
      });
      await nextTick();

      const mask = document.body.querySelector<HTMLButtonElement>('.ex-sider__mask');
      expect(mask).not.toBeNull();
      expect(mask?.type).toBe('button');
      mask?.click();
      await nextTick();

      expect(wrapper.get('aside').classes()).not.toContain('ex-sider--collapsed');
      expect(wrapper.emitted('collapse')).toContainEqual([true, 'mask']);
      wrapper.unmount();
      expect(document.body.querySelector('.ex-sider__mask')).toBeNull();
    });

    it('运行时切换 breakpoint 会释放旧监听并应用新查询', async () => {
      const wrapper = mount(ExSider, { props: { breakpoint: 'sm' } });
      await nextTick();
      const first = mediaQueries[0];
      expect(first?.media).toBe('(min-width: 480px)');

      await wrapper.setProps({ breakpoint: 'xl' });
      expect(first?.listeners.size).toBe(0);
      expect(mediaQueries[1]?.media).toBe('(min-width: 1280px)');
      wrapper.unmount();
    });

    it('breakpoint API 不再包含无意义的 xs 阈值', () => {
      const runtimeProps = (ExSider as unknown as { props: Record<string, unknown> }).props;
      expect(runtimeProps).not.toHaveProperty('class');
      expect(runtimeProps).not.toHaveProperty('style');
      expect(runtimeProps).toHaveProperty('defaultCollapsed');

      const wrapper = mount(ExSider, {
        props: { breakpoint: 'xs' as never },
      });
      expect(window.matchMedia).not.toHaveBeenCalled();
      expect(wrapper.get('aside').classes()).not.toContain('ex-sider--broken');
    });
  });

  describe('ExContent', () => {
    it('默认使用 main 且不重复声明 role', () => {
      const wrapper = mount(ExContent, { slots: { default: 'Main content' } });

      expect(wrapper.element.tagName).toBe('MAIN');
      expect(wrapper.attributes('role')).toBeUndefined();
      expect(wrapper.text()).toBe('Main content');
    });

    it.each(['div', 'section'] as const)('允许切换为 %s 避免重复 main 地标', tag => {
      const wrapper = mount(ExContent, { props: { tag } });
      expect(wrapper.element.tagName).toBe(tag.toUpperCase());
    });

    it('网格和扫描线仅添加状态类，不创建装饰 DOM', () => {
      const wrapper = mount(ExContent, {
        props: { grid: true, scanline: true },
        slots: { default: h('p', 'Content') },
      });

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['ex-content--grid', 'ex-content--scanline'])
      );
      expect(wrapper.find('.ex-content__grid').exists()).toBe(false);
      expect(wrapper.find('.ex-content__scanline').exists()).toBe(false);
      expect(wrapper.get('.ex-content__inner').text()).toBe('Content');
    });

    it('透传属性并暴露真实元素', () => {
      const wrapper = mount(ExContent, {
        attrs: { class: 'custom-content', 'aria-label': 'Workspace' },
      });
      const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };

      expect(wrapper.classes()).toContain('custom-content');
      expect(wrapper.attributes('aria-label')).toBe('Workspace');
      expect(exposed.getElement()).toBe(wrapper.element);
    });
  });

  describe('ExContainer', () => {
    it('默认、流式和固定尺寸类互斥', async () => {
      const wrapper = mount(ExContainer);
      expect(wrapper.classes()).toEqual(['ex-container']);

      await wrapper.setProps({ size: 'lg' });
      expect(wrapper.classes()).toContain('ex-container--lg');

      await wrapper.setProps({ fluid: true });
      expect(wrapper.classes()).toContain('ex-container--fluid');
      expect(wrapper.classes()).not.toContain('ex-container--lg');
    });

    it('透传原生属性且暴露元素', () => {
      const wrapper = mount(ExContainer, {
        attrs: { class: 'custom-container', style: 'background: red' },
        slots: { default: 'Container' },
      });
      const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };

      expect(wrapper.classes()).toContain('custom-container');
      expect(wrapper.attributes('style')).toContain('background: red');
      expect(exposed.getElement()).toBe(wrapper.element);
    });
  });
});
