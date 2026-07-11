import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import ExMenu from '../../../src/components/menu/ExMenu.vue';
import ExMenuItem from '../../../src/components/menu/ExMenuItem.vue';
import ExSubMenu from '../../../src/components/menu/ExSubMenu.vue';

const wrappers: VueWrapper[] = [];

const track = (wrapper: VueWrapper): VueWrapper => {
  wrappers.push(wrapper);
  return wrapper;
};

const submenuSlot = () => h(ExMenuItem, { itemKey: 'child' }, () => '子项');

describe('ExSubMenu', () => {
  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    document.body.innerHTML = '';
  });

  it('独立使用时渲染按钮、菜单与稳定关联关系', () => {
    const wrapper = track(
      mount(ExSubMenu, {
        props: { itemKey: 'group', title: '分组' },
        slots: { default: submenuSlot },
      })
    );
    const title = wrapper.get('.ex-submenu__title');
    const list = wrapper.get('.ex-submenu__list');

    expect(wrapper.attributes('role')).toBe('none');
    expect(title.element.tagName).toBe('BUTTON');
    expect(title.attributes('role')).toBe('menuitem');
    expect(title.attributes('aria-haspopup')).toBe('menu');
    expect(title.attributes('aria-controls')).toBe(list.attributes('id'));
    expect(title.text()).toBe('分组');
    expect(list.attributes('role')).toBe('menu');
    expect(list.attributes('data-ex-menu-list')).toBe('');
  });

  it('点击只发出一次请求事件并使用无布局抖动的折叠状态', async () => {
    const wrapper = track(
      mount(ExSubMenu, {
        props: { itemKey: 'group', title: '分组' },
        slots: { default: submenuSlot },
      })
    );

    const collapse = wrapper.get('.ex-submenu__collapse');
    expect(collapse.attributes('inert')).toBeDefined();
    expect(collapse.attributes('aria-hidden')).toBe('true');

    await wrapper.get('.ex-submenu__title').trigger('click');
    expect(wrapper.classes()).toContain('ex-submenu--open');
    expect(wrapper.emitted('title-click')).toHaveLength(1);
    expect(wrapper.emitted('open-change')).toEqual([[true]]);
    expect(collapse.attributes('style')).toBeUndefined();
    expect(collapse.attributes('inert')).toBeUndefined();
    expect(collapse.attributes('aria-hidden')).toBeUndefined();

    await wrapper.get('.ex-submenu__title').trigger('click');
    expect(wrapper.emitted('open-change')).toEqual([[true], [false]]);
  });

  it('禁用状态使用原生 disabled 并阻断全部打开入口', async () => {
    const wrapper = track(
      mount(ExSubMenu, {
        props: { itemKey: 'group', title: '分组', disabled: true },
        slots: { default: submenuSlot },
      })
    );
    const title = wrapper.get('.ex-submenu__title');
    const exposed = wrapper.vm as unknown as {
      toggle: () => void;
      open: () => void;
      isOpen: () => boolean;
    };

    expect(title.attributes('disabled')).toBeDefined();
    await title.trigger('click');
    exposed.toggle();
    exposed.open();
    expect(exposed.isOpen()).toBe(false);
    expect(wrapper.emitted('open-change')).toBeUndefined();
  });

  it('暴露方法与点击共享同一真实状态并允许显式关闭', async () => {
    const wrapper = track(
      mount(ExSubMenu, {
        props: { itemKey: 'group', title: '分组' },
        slots: { default: submenuSlot },
      })
    );
    const exposed = wrapper.vm as unknown as {
      isOpen: () => boolean;
      toggle: () => void;
      open: () => void;
      close: () => void;
      getElement: () => HTMLElement | null;
    };

    exposed.open();
    await nextTick();
    expect(exposed.isOpen()).toBe(true);
    exposed.toggle();
    await nextTick();
    expect(exposed.isOpen()).toBe(false);
    exposed.open();
    exposed.close();
    await nextTick();
    expect(exposed.isOpen()).toBe(false);
    expect(exposed.getElement()).toBe(wrapper.element);
  });

  it('同页实例生成唯一且可水合的 aria-controls', () => {
    const Host = defineComponent({
      setup: () => () =>
        h('div', [
          h(ExSubMenu, { itemKey: 'same-a', title: 'A' }),
          h(ExSubMenu, { itemKey: 'same-b', title: 'B' }),
        ]),
    });
    const wrapper = track(mount(Host));
    const titles = wrapper.findAll('.ex-submenu__title');

    expect(titles[0].attributes('aria-controls')).not.toBe(titles[1].attributes('aria-controls'));
  });

  it('水平模式复用单层 Dropdown 菜单语义', async () => {
    const wrapper = track(
      mount(ExMenu, {
        attachTo: document.body,
        props: { mode: 'horizontal' },
        slots: {
          default: () =>
            h(ExSubMenu, { itemKey: 'group', title: '分组' }, { default: submenuSlot }),
        },
      })
    );

    await wrapper.get('.ex-submenu__title').trigger('click');
    await nextTick();
    const popup = document.querySelector<HTMLElement>('.ex-dropdown__menu');
    const popupList = document.querySelector<HTMLElement>('.ex-submenu__list--popup');

    expect(popup?.getAttribute('role')).toBe('menu');
    expect(popupList?.getAttribute('role')).toBe('none');
    expect(popup?.querySelectorAll('[role="menu"]')).toHaveLength(0);
    expect(wrapper.get('.ex-submenu__title').text()).toBe('分组');
    expect(wrapper.get('.ex-submenu__title').attributes('aria-controls')).toBe(popup?.id);
  });

  it('ArrowDown 打开并聚焦首项，Escape 关闭并恢复标题焦点', async () => {
    const wrapper = track(
      mount(ExMenu, {
        attachTo: document.body,
        props: { mode: 'horizontal' },
        slots: {
          default: () =>
            h(
              ExSubMenu,
              { itemKey: 'group', title: '分组' },
              {
                default: () => [
                  h(ExMenuItem, { itemKey: 'a' }, () => 'A'),
                  h(ExMenuItem, { itemKey: 'b' }, () => 'B'),
                ],
              }
            ),
        },
      })
    );
    const title = wrapper.get('.ex-submenu__title');
    (title.element as HTMLElement).focus();

    await title.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    const firstItem = document.querySelector<HTMLElement>(
      '.ex-submenu__list--popup .ex-menu-item__action'
    );
    expect(title.attributes('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(firstItem);

    firstItem?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(title.attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(title.element);
  });

  it('内联子菜单支持 ArrowUp 聚焦末项、ArrowRight 打开与标题 Escape 关闭', async () => {
    const wrapper = track(
      mount(ExMenu, {
        attachTo: document.body,
        props: { mode: 'inline' },
        slots: {
          default: () =>
            h(
              ExSubMenu,
              { itemKey: 'group', title: '分组' },
              {
                default: () => [
                  h(ExMenuItem, { itemKey: 'a' }, () => 'A'),
                  h(ExMenuItem, { itemKey: 'b' }, () => 'B'),
                ],
              }
            ),
        },
      })
    );
    const title = wrapper.get('.ex-submenu__title');

    await title.trigger('keydown', { key: 'ArrowUp' });
    await nextTick();
    const actions = wrapper.findAll('.ex-submenu__list .ex-menu-item__action');
    expect(document.activeElement).toBe(actions[1].element);

    actions[1].element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    await nextTick();
    expect(title.attributes('aria-expanded')).toBe('false');

    await title.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(document.activeElement).toBe(actions[0].element);
    await title.trigger('keydown', { key: 'Escape' });
    expect(title.attributes('aria-expanded')).toBe('false');
  });

  it('水平标题 ArrowRight 移到下一同级项而不是错误打开子菜单', async () => {
    const wrapper = track(
      mount(ExMenu, {
        attachTo: document.body,
        props: { mode: 'horizontal' },
        slots: {
          default: () => [
            h(ExSubMenu, { itemKey: 'group', title: '分组' }, { default: submenuSlot }),
            h(ExMenuItem, { itemKey: 'next' }, () => '下一项'),
          ],
        },
      })
    );
    const title = wrapper.get('.ex-submenu__title');
    const next = wrapper.get('.ex-menu-item__action');
    (title.element as HTMLElement).focus();

    await title.trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(next.element);
    expect(title.attributes('aria-expanded')).toBe('false');
  });

  it('根属性正确透传且旧 class/style 属性不再作为独立 props', () => {
    const wrapper = track(
      mount(ExSubMenu, {
        props: { itemKey: 'group', title: '分组' },
        attrs: {
          class: 'custom-submenu',
          style: { marginTop: '8px' },
          'data-track-id': 'group',
          'aria-label': '更多选项',
        },
      })
    );

    expect(wrapper.classes()).toContain('custom-submenu');
    expect(wrapper.attributes('style')).toContain('margin-top: 8px');
    expect(wrapper.attributes('data-track-id')).toBe('group');
    expect(wrapper.get('.ex-submenu__title').attributes('aria-label')).toBe('更多选项');
  });
});
