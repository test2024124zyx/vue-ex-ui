import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExAnchor from '../../../src/components/anchor/ExAnchor.vue';
import ExAnchorLink from '../../../src/components/anchor/ExAnchorLink.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ExAnchorExposed } from '../../../src/components/anchor/types';

const rect = (values: Partial<DOMRect>): DOMRect =>
  ({
    x: 0,
    y: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...values,
  }) as DOMRect;

describe('ExAnchor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('点击事件携带完整条目，并使用注册元素更新指示点', async () => {
    const section = document.createElement('section');
    section.id = 'overview';
    document.body.append(section);
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(rect({ top: 300, height: 100 }));
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const wrapper = mount(ExAnchor, {
      attachTo: document.body,
      slots: {
        default: () => h(ExAnchorLink, { href: '#overview', title: 'Overview' }),
      },
    });
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue(rect({ top: 10 }));
    const linkElement = wrapper.find('.ex-anchor-link').element as HTMLElement;
    vi.spyOn(linkElement, 'getBoundingClientRect').mockReturnValue(
      rect({ top: 30, bottom: 50, height: 20 })
    );

    await wrapper.find('a').trigger('click');
    await nextTick();

    expect(wrapper.emitted('click')?.[0]).toEqual([
      '#overview',
      { href: '#overview', title: 'Overview', element: linkElement },
    ]);
    expect(wrapper.find('.ex-anchor__ink-ball').attributes('style')).toContain('top: 30px');
  });

  it('链接属性变化后更新注册信息而不是保留旧标题和地址', async () => {
    const first = document.createElement('div');
    first.id = 'first';
    const second = document.createElement('div');
    second.id = 'second';
    document.body.append(first, second);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const href = ref('#first');
    const title = ref('First');
    const wrapper = mount(ExAnchor, {
      slots: {
        default: () => h(ExAnchorLink, { href: href.value, title: title.value }),
      },
    });

    expect(wrapper.emitted('change')).toEqual([['#first']]);

    href.value = '#second';
    title.value = 'Second';
    await nextTick();
    expect(wrapper.emitted('change')).toEqual([['#first'], ['#second']]);
    await wrapper.find('a').trigger('click');

    expect(wrapper.emitted('click')?.[0]?.[0]).toBe('#second');
    expect(wrapper.emitted('click')?.[0]?.[1]).toMatchObject({
      href: '#second',
      title: 'Second',
    });
  });

  it('危险地址移出活动列表，恢复有效地址后重新参与滚动定位', async () => {
    const section = document.createElement('section');
    section.id = 'active';
    document.body.append(section);
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const href = ref('#active');
    const wrapper = mount(ExAnchor, {
      slots: { default: () => h(ExAnchorLink, { href: href.value, title: '活动锚点' }) },
    });
    await wrapper.get('a').trigger('click');
    expect(scroll).toHaveBeenCalledOnce();

    href.value = 'javascript:alert(1)';
    await nextTick();
    expect(wrapper.emitted('change')).toEqual([['#active'], ['']]);
    expect(wrapper.get('a').classes()).not.toContain('is-active');
    await wrapper.get('a').trigger('click');
    expect(scroll).toHaveBeenCalledOnce();
    expect(wrapper.emitted('click')).toHaveLength(1);

    href.value = '#active';
    await nextTick();
    await wrapper.get('a').trigger('click');
    expect(wrapper.emitted('change')).toEqual([['#active'], [''], ['#active']]);
    expect(scroll).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it('容器变化时迁移滚动监听器', async () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const firstRemove = vi.spyOn(first, 'removeEventListener');
    const secondAdd = vi.spyOn(second, 'addEventListener');
    const wrapper = mount(ExAnchor, { props: { container: () => first } });

    await wrapper.setProps({ container: () => second });

    expect(firstRemove).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(secondAdd).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it.each(['.chapter:nth-of-type(2)', '[data-section="chapter:2"]'])(
    '选择器 %s 可定位同页目标，也能通过回车操作',
    async href => {
      const group = document.createElement('div');
      group.innerHTML =
        '<section class="chapter"></section><section class="chapter" data-section="chapter:2"></section>';
      document.body.append(group);
      const target = group.querySelector(href)!;
      vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect({ top: 240 }));
      const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      const wrapper = mount(ExAnchor, {
        slots: { default: () => h(ExAnchorLink, { href, title: '第二章' }) },
      });
      await nextTick();
      const link = wrapper.get('a');
      expect(link.attributes('href')).toBeUndefined();
      expect(link.attributes('role')).toBe('link');
      expect(link.attributes('tabindex')).toBe('0');
      await link.trigger('keydown', { key: 'Enter' });
      expect(scroll).toHaveBeenCalledExactlyOnceWith({ top: 240, behavior: 'smooth' });
      expect(wrapper.emitted('click')?.[0]?.[0]).toBe(href);
      wrapper.unmount();
    }
  );

  it('同一次渲染新增多个锚点时只发布最终选中的地址', async () => {
    const sections = ['first', 'second', 'third'];
    for (const [index, id] of sections.entries()) {
      const section = document.createElement('section');
      section.id = id;
      vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(rect({ top: index - 2 }));
      document.body.append(section);
    }
    const count = ref(1);
    const wrapper = mount(ExAnchor, {
      slots: {
        default: () =>
          sections
            .slice(0, count.value)
            .map(id => h(ExAnchorLink, { key: id, href: `#${id}`, title: id })),
      },
    });
    count.value = sections.length;
    await nextTick();
    expect(wrapper.emitted('change')).toEqual([['#first'], ['#third']]);
    wrapper.unmount();
  });

  it('标签伪类选择器可以定位在锚点之后才挂载的目标', async () => {
    const selector = 'section:nth-of-type(2)';
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const wrapper = mount(ExAnchor, {
      slots: { default: () => h(ExAnchorLink, { href: selector, title: '第二节' }) },
    });
    await nextTick();
    const link = wrapper.get('a');
    expect(link.attributes('href')).toBeUndefined();
    expect(link.attributes('tabindex')).toBe('0');

    const area = document.createElement('main');
    const target = document.createElement('section');
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect({ top: 120 }));
    area.append(document.createElement('section'), target);
    document.body.append(area);
    await link.trigger('click');
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ top: 120, behavior: 'smooth' });
    expect(wrapper.emitted('change')).toEqual([[selector]]);
    wrapper.unmount();
  });

  it('平滑滚动中同一批次替换活动锚点时不发布中间空地址', async () => {
    for (const [id, top] of [
      ['first', 100],
      ['second', -2],
      ['third', -1],
    ] as const) {
      const section = document.createElement('section');
      section.id = id;
      vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(rect({ top }));
      document.body.append(section);
    }
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const shown = ref(['first']);
    const wrapper = mount(ExAnchor, {
      slots: {
        default: () =>
          shown.value.map(id => h(ExAnchorLink, { key: id, href: `#${id}`, title: id })),
      },
    });
    await wrapper.get('a').trigger('click');
    shown.value = ['second', 'third'];
    await nextTick();
    expect(wrapper.emitted('change')).toEqual([['#first'], ['#third']]);
    wrapper.unmount();
  });

  it('自定义滚动容器使用容器矩形与 scrollTop 计算目标位置', async () => {
    const container = document.createElement('div');
    const target = document.createElement('section');
    target.id = 'inside-container';
    document.body.append(container, target);
    Object.defineProperty(container, 'scrollTop', { configurable: true, value: 20 });
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(rect({ top: 50 }));
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect({ top: 150 }));
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    const wrapper = mount(ExAnchor, {
      props: { container: () => container },
      slots: {
        default: () => h(ExAnchorLink, { href: '#inside-container', title: 'Inside container' }),
      },
    });

    await wrapper.find('a').trigger('click');

    expect(scrollTo).toHaveBeenCalledWith({ top: 120, behavior: 'smooth' });
    expect((wrapper.vm as unknown as ExAnchorExposed).getElement()).toBe(wrapper.element);
    expect(wrapper.element.tagName).toBe('NAV');
  });

  it('无效选择器不会抛错或创建无意义的动画计时器', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ExAnchor, {
      slots: {
        default: () => h(ExAnchorLink, { href: '#broken[', title: 'Broken' }),
      },
    });

    await expect(wrapper.find('a').trigger('click')).resolves.toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('卸载会清理滚动动画计时器', async () => {
    vi.useFakeTimers();
    const target = document.createElement('div');
    target.id = 'valid';
    document.body.append(target);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const wrapper = mount(ExAnchor, {
      slots: {
        default: () => h(ExAnchorLink, { href: '#valid', title: 'Valid' }),
      },
    });

    await wrapper.find('a').trigger('click');
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('导航地标名称跟随 ConfigProvider 语言', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: { default: () => h(ExAnchor) },
    });

    expect(wrapper.get('nav').attributes('aria-label')).toBe('锚点导航');
    await wrapper.setProps({ locale: 'en-US' });
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Anchor navigation');
  });

  it('系统要求减少动态效果时使用即时滚动且不创建动画抑制定时器', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    const target = document.createElement('div');
    target.id = 'reduced-motion-target';
    document.body.append(target);
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(rect({ top: 200 }));
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const wrapper = mount(ExAnchor, {
      slots: {
        default: () => h(ExAnchorLink, { href: '#reduced-motion-target', title: 'Reduced motion' }),
      },
    });

    await wrapper.find('a').trigger('click');

    expect(scrollTo).toHaveBeenCalledWith({ top: 200, behavior: 'auto' });
    expect(vi.getTimerCount()).toBe(0);
    wrapper.unmount();
    vi.unstubAllGlobals();
  });
});
