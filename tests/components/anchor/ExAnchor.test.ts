import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExAnchor from '../../../src/components/anchor/ExAnchor.vue';
import ExAnchorLink from '../../../src/components/anchor/ExAnchorLink.vue';
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

    href.value = '#second';
    title.value = 'Second';
    await nextTick();
    await wrapper.find('a').trigger('click');

    expect(wrapper.emitted('click')?.[0]?.[0]).toBe('#second');
    expect(wrapper.emitted('click')?.[0]?.[1]).toMatchObject({
      href: '#second',
      title: 'Second',
    });
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
});
