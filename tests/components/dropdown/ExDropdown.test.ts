import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExDropdown from '../../../src/components/dropdown/ExDropdown.vue';
import ExDropdownItem from '../../../src/components/dropdown/ExDropdownItem.vue';
import type { DropdownItemData, ExDropdownExposed } from '../../../src/components/dropdown/types';

const items: DropdownItemData[] = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制', disabled: true },
  { key: 'delete', label: '删除', divided: true },
];

describe('ExDropdown', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mountDropdown = (
    props: Record<string, unknown> = {},
    slots: Record<string, unknown> = {},
    attrs: Record<string, unknown> = {}
  ) => {
    wrapper = mount(ExDropdown, {
      attachTo: document.body,
      props: { items, trigger: 'click', ...props },
      attrs,
      slots: {
        default: (slotProps: { triggerProps: Record<string, unknown> }) =>
          h(
            'button',
            {
              ...slotProps.triggerProps,
              type: 'button',
              class: 'dropdown-trigger-button',
            },
            '菜单'
          ),
        ...slots,
      },
    });
    return wrapper;
  };

  const triggerButton = () => wrapper!.find<HTMLButtonElement>('.dropdown-trigger-button');
  const triggerContainer = () => wrapper!.find<HTMLElement>('.ex-dropdown__trigger');
  const menuElement = () => document.querySelector<HTMLElement>('.ex-dropdown__menu')!;
  const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const exposed = () => wrapper!.vm as unknown as ExDropdownExposed;

  const setRects = (
    trigger = { top: 100, right: 180, bottom: 140, left: 100, width: 80, height: 40 },
    menu = { top: 0, right: 0, bottom: 0, left: 0, width: 120, height: 60 }
  ) => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600);
    triggerContainer().element.getBoundingClientRect = vi.fn(() => trigger as DOMRect);
    menuElement().getBoundingClientRect = vi.fn(() => menu as DOMRect);
  };

  it('触发容器不伪装成按钮，交互语义由单一原生触发器承担', () => {
    mountDropdown();
    expect(triggerContainer().attributes('role')).toBeUndefined();
    expect(triggerContainer().attributes('tabindex')).toBeUndefined();
    expect(wrapper!.findAll('button')).toHaveLength(1);
    expect(triggerButton().attributes('aria-haspopup')).toBe('menu');
    expect(triggerButton().attributes('aria-expanded')).toBe('false');
    expect(triggerButton().attributes('aria-controls')).toBe(menuElement().id);
  });

  it('菜单通过触发容器文本命名，显式 ariaLabel 可覆盖该关联', async () => {
    mountDropdown();
    expect(menuElement().getAttribute('aria-labelledby')).toBe(triggerContainer().element.id);
    expect(menuElement().hasAttribute('aria-label')).toBe(false);

    await wrapper!.setProps({ ariaLabel: '文件操作' });
    expect(menuElement().getAttribute('aria-label')).toBe('文件操作');
    expect(menuElement().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('受控初始 visible=true 立即同步但不伪造 show 生命周期事件', async () => {
    mountDropdown({ visible: true });
    await flushPromises();
    expect(triggerButton().attributes('aria-expanded')).toBe('true');
    expect(menuElement().style.display).not.toBe('none');
    expect(wrapper!.emitted('show')).toBeUndefined();
  });

  it('浏览器未提供动画帧能力时同步响应位置配置变化', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    vi.stubGlobal('cancelAnimationFrame', undefined);

    try {
      mountDropdown({ visible: true });
      setRects();
      await flushPromises();
      await wrapper!.setProps({ placement: 'top-start' });
      expect(menuElement().dataset.placement).toBe('top-start');
      expect(menuElement().style.top).toBe('32px');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('受控点击只请求更新，父级真正同步后才发出 show', async () => {
    mountDropdown({ visible: false });
    await triggerButton().trigger('click');
    expect(wrapper!.emitted('update:visible')).toEqual([[true]]);
    expect(wrapper!.emitted('show')).toBeUndefined();
    expect(triggerButton().attributes('aria-expanded')).toBe('false');

    await wrapper!.setProps({ visible: true });
    await flushPromises();
    expect(wrapper!.emitted('show')).toEqual([[]]);
    expect(triggerButton().attributes('aria-expanded')).toBe('true');
  });

  it('非受控点击在真实状态变化时各发出一次 show/hide', async () => {
    mountDropdown();
    await triggerButton().trigger('click');
    await triggerButton().trigger('click');
    expect(wrapper!.emitted('update:visible')).toEqual([[true], [false]]);
    expect(wrapper!.emitted('show')).toEqual([[]]);
    expect(wrapper!.emitted('hide')).toEqual([[]]);
  });

  it('禁用状态阻止所有打开请求并透传 aria-disabled', async () => {
    mountDropdown({ disabled: true });
    await triggerButton().trigger('click');
    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    expect(triggerButton().attributes('aria-disabled')).toBe('true');
    expect(wrapper!.emitted('update:visible')).toBeUndefined();
  });

  it('hover 延迟可配置，进入菜单会取消待执行的关闭', async () => {
    vi.useFakeTimers();
    mountDropdown({ trigger: 'hover', showDelay: 100, hideDelay: 150 });
    await triggerContainer().trigger('mouseenter');
    await vi.advanceTimersByTimeAsync(99);
    expect(wrapper!.emitted('show')).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(wrapper!.emitted('show')).toEqual([[]]);

    await triggerContainer().trigger('mouseleave');
    await vi.advanceTimersByTimeAsync(100);
    menuElement().dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(100);
    expect(wrapper!.emitted('hide')).toBeUndefined();

    menuElement().dispatchEvent(new MouseEvent('mouseleave'));
    await vi.advanceTimersByTimeAsync(150);
    expect(wrapper!.emitted('hide')).toEqual([[]]);
  });

  it('contextmenu 按指针坐标定位而不是错误复用触发器位置', async () => {
    mountDropdown({ trigger: 'contextmenu', offset: 8 });
    setRects();
    await triggerContainer().trigger('contextmenu', { clientX: 300, clientY: 200 });
    await flushPromises();
    exposed().updatePosition();
    expect(menuElement().style.left).toBe('308px');
    expect(menuElement().style.top).toBe('208px');
  });

  it('空间不足时翻转 placement 并暴露真实位置', async () => {
    mountDropdown({ placement: 'bottom-start', offset: 8 });
    setRects({ top: 540, right: 180, bottom: 580, left: 100, width: 80, height: 40 });
    await triggerButton().trigger('click');
    await flushPromises();
    exposed().updatePosition();
    expect(menuElement().dataset.placement).toBe('top-start');
    expect(menuElement().style.top).toBe('472px');
  });

  it('matchTriggerWidth 使用触发器精确宽度且自定义层级真实生效', async () => {
    mountDropdown({ matchTriggerWidth: true, zIndex: 2100 });
    setRects();
    await triggerButton().trigger('click');
    await flushPromises();
    exposed().updatePosition();
    expect(menuElement().style.width).toBe('80px');
    expect(menuElement().style.zIndex).toBe('2100');
  });

  it('非法 placement 与 offset 回退到安全默认值', async () => {
    mountDropdown({ placement: 'outside', offset: Number.POSITIVE_INFINITY });
    setRects();
    await triggerButton().trigger('click');
    await flushPromises();
    exposed().updatePosition();
    expect(menuElement().dataset.placement).toBe('bottom-start');
    expect(menuElement().style.top).toBe('140px');
  });

  it('ArrowDown 打开菜单、聚焦菜单容器并跳过禁用项导航', async () => {
    mountDropdown();
    triggerButton().element.focus();
    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    expect(document.activeElement).toBe(menuElement());
    expect(
      document.getElementById(menuElement().getAttribute('aria-activedescendant')!)?.textContent
    ).toContain('编辑');

    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await flushPromises();
    expect(
      document.getElementById(menuElement().getAttribute('aria-activedescendant')!)?.textContent
    ).toContain('删除');
  });

  it('ArrowUp、Home、End 支持环绕与首尾导航', async () => {
    mountDropdown();
    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await flushPromises();
    expect(
      document.getElementById(menuElement().getAttribute('aria-activedescendant')!)?.textContent
    ).toContain('删除');
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await flushPromises();
    expect(
      document.getElementById(menuElement().getAttribute('aria-activedescendant')!)?.textContent
    ).toContain('编辑');
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await flushPromises();
    expect(
      document.getElementById(menuElement().getAttribute('aria-activedescendant')!)?.textContent
    ).toContain('删除');
  });

  it('Enter 选择高亮数据项并将焦点归还触发器', async () => {
    mountDropdown();
    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flushPromises();
    expect(wrapper!.emitted('item-click')?.[0]).toEqual([items[0]]);
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([false]);
    expect(document.activeElement).toBe(triggerButton().element);
  });

  it('Escape 关闭并归还焦点，Tab 关闭但不强制恢复焦点', async () => {
    mountDropdown();
    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flushPromises();
    expect(document.activeElement).toBe(triggerButton().element);

    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await flushPromises();
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([false]);
    expect(document.activeElement).not.toBe(triggerButton().element);
  });

  it('字符键执行标签前缀导航', async () => {
    mountDropdown();
    await triggerButton().trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    menuElement().dispatchEvent(new KeyboardEvent('keydown', { key: '删', bubbles: true }));
    await flushPromises();
    expect(
      document.getElementById(menuElement().getAttribute('aria-activedescendant')!)?.textContent
    ).toContain('删除');
  });

  it('禁用项不可选择且 divided 生成真实分隔线', async () => {
    mountDropdown();
    await triggerButton().trigger('click');
    await flushPromises();
    expect(document.querySelectorAll('[role="separator"]')).toHaveLength(1);
    menuItems()[1]?.click();
    expect(wrapper!.emitted('item-click')).toBeUndefined();
    expect(triggerButton().attributes('aria-expanded')).toBe('true');
  });

  it('自定义 ExDropdownItem 选择后关闭，图标使用可继承主题色的遮罩渲染', async () => {
    const onClick = vi.fn();
    mountDropdown(
      { items: [] },
      {
        menu: () =>
          h(ExDropdownItem, {
            label: '设置',
            icon: '/settings.svg',
            divided: true,
            onClick,
          }),
      }
    );
    await triggerButton().trigger('click');
    await flushPromises();
    menuItems()[0]?.click();
    await flushPromises();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([false]);
    expect(document.querySelector('.ex-dropdown-item__icon.ex-icon')).not.toBeNull();
    expect(document.querySelector('.ex-dropdown-item__icon .ex-icon__image-mask')).not.toBeNull();
    expect(document.querySelector('.ex-dropdown-item__icon')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  it('鼠标高亮菜单项只滚动菜单容器，不调用会带动页面的 scrollIntoView', async () => {
    const original = HTMLElement.prototype.scrollIntoView;
    const pageScroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: pageScroll,
    });

    try {
      mountDropdown();
      await triggerButton().trigger('click');
      await flushPromises();

      menuItems()[0]?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await flushPromises();

      expect(pageScroll).not.toHaveBeenCalled();
      expect(menuElement().getAttribute('aria-activedescendant')).toBe(menuItems()[0]?.id);
    } finally {
      if (original) HTMLElement.prototype.scrollIntoView = original;
      else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
    }
  });

  it('hideOnClick=false 时选择项不会关闭菜单', async () => {
    mountDropdown({ hideOnClick: false });
    await triggerButton().trigger('click');
    await flushPromises();
    menuItems()[0]?.click();
    expect(wrapper!.emitted('item-click')?.[0]).toEqual([items[0]]);
    expect(triggerButton().attributes('aria-expanded')).toBe('true');
  });

  it('点击外部请求关闭，菜单和触发器内部 pointerdown 不误关', async () => {
    mountDropdown();
    await triggerButton().trigger('click');
    await flushPromises();
    menuElement().dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    expect(triggerButton().attributes('aria-expanded')).toBe('true');

    const outside = document.createElement('button');
    document.body.append(outside);
    outside.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    await flushPromises();
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('只在菜单打开期间注册并释放全局 pointerdown 监听', async () => {
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    mountDropdown();
    expect(addListener.mock.calls.some(([event]) => event === 'pointerdown')).toBe(false);

    await triggerButton().trigger('click');
    await flushPromises();
    expect(addListener.mock.calls.some(([event]) => event === 'pointerdown')).toBe(true);

    await triggerButton().trigger('click');
    await flushPromises();
    expect(removeListener.mock.calls.some(([event]) => event === 'pointerdown')).toBe(true);
  });

  it('disabled 动态变为 true 时请求关闭已打开菜单', async () => {
    mountDropdown();
    await triggerButton().trigger('click');
    await wrapper!.setProps({ disabled: true });
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('公开方法遵循受控状态并返回根元素', async () => {
    mountDropdown({ visible: false });
    expect(exposed().getElement()).toBe(wrapper!.find('.ex-dropdown').element);
    exposed().show();
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([true]);
    expect(wrapper!.emitted('show')).toBeUndefined();
    await wrapper!.setProps({ visible: true });
    exposed().hide();
    expect(wrapper!.emitted('update:visible')?.at(-1)).toEqual([false]);
  });

  it('根元素合并原生 class、style 与 data 属性', () => {
    mountDropdown(
      {},
      {},
      {
        class: 'custom-dropdown',
        style: { opacity: '0.9' },
        'data-testid': 'dropdown',
      }
    );
    expect(wrapper!.classes()).toContain('custom-dropdown');
    expect(wrapper!.attributes('style')).toContain('opacity: 0.9');
    expect(wrapper!.attributes('data-testid')).toBe('dropdown');
  });
});
