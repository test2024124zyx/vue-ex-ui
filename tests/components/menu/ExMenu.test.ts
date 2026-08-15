import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ExMenu from '../../../src/components/menu/ExMenu.vue';
import ExMenuItem from '../../../src/components/menu/ExMenuItem.vue';
import ExSubMenu from '../../../src/components/menu/ExSubMenu.vue';
import { setLocale } from '../../../src/locale';
import type { MenuItem, MenuSelectInfo } from '../../../src/components/menu/types';

const wrappers: VueWrapper[] = [];

const mountMenu = (options: Parameters<typeof mount>[1] = {}): VueWrapper => {
  const wrapper = mount(ExMenu, options);
  wrappers.push(wrapper);
  return wrapper;
};

describe('ExMenu', () => {
  beforeEach(() => {
    setLocale('zh-CN');
  });

  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    document.body.innerHTML = '';
    setLocale('en-US');
    vi.restoreAllMocks();
  });

  it('默认使用原生导航与垂直菜单语义', () => {
    const wrapper = mountMenu();
    const menu = wrapper.get('nav.ex-menu');
    const list = wrapper.get('.ex-menu__list');

    expect(menu.attributes('aria-label')).toBe('菜单');
    expect(menu.classes()).toContain('ex-menu--vertical');
    expect(list.attributes('role')).toBe('menu');
    expect(list.attributes('aria-orientation')).toBe('vertical');
    expect(list.attributes('data-ex-menu-list')).toBe('');
  });

  it('规范三种模式并拒绝生成非法模式类', async () => {
    const wrapper = mountMenu({ props: { mode: 'horizontal' } });
    expect(wrapper.get('.ex-menu__list').attributes('role')).toBe('menubar');
    expect(wrapper.classes()).toContain('ex-menu--horizontal');

    await wrapper.setProps({ mode: 'inline' });
    expect(wrapper.classes()).toContain('ex-menu--inline');

    await wrapper.setProps({ mode: 'unknown' as never });
    expect(wrapper.classes()).toContain('ex-menu--vertical');
    expect(wrapper.classes()).not.toContain('ex-menu--unknown');
  });

  it('透传根原生属性并过滤已删除伪属性', () => {
    const wrapper = mountMenu({
      attrs: {
        class: 'product-menu',
        style: { maxWidth: '320px' },
        'aria-label': '产品导航',
        'data-track-id': 'main-menu',
        responsive: true,
        breakpoint: 900,
        ariaLabel: '旧标签',
      },
    });

    expect(wrapper.classes()).toContain('product-menu');
    expect(wrapper.attributes('style')).toContain('max-width: 320px');
    expect(wrapper.attributes('aria-label')).toBe('产品导航');
    expect(wrapper.attributes('data-track-id')).toBe('main-menu');
    expect(wrapper.attributes('responsive')).toBeUndefined();
    expect(wrapper.attributes('breakpoint')).toBeUndefined();
    expect(wrapper.attributes('arialabel')).toBeUndefined();
  });

  it('无需全局注册即可递归渲染任意深度数据', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const items: MenuItem[] = [
      {
        key: 'platform',
        label: '平台',
        children: [
          {
            key: 'developer',
            label: '开发者',
            children: [{ key: 'api', label: 'API 文档' }],
          },
          { key: 'console', label: '控制台' },
        ],
      },
    ];
    const wrapper = mountMenu({ props: { items } });

    expect(wrapper.findAll('.ex-submenu')).toHaveLength(2);
    expect(wrapper.findAll('.ex-menu-item')).toHaveLength(2);
    expect(wrapper.text()).toContain('API 文档');
    expect(wrapper.text()).toContain('控制台');
    expect(warn.mock.calls.flat().join(' ')).not.toContain('Failed to resolve component');
  });

  it('叶节点不渲染子菜单箭头，列表样式显式清除 marker', () => {
    const wrapper = mountMenu({
      props: {
        items: [
          {
            key: 'group',
            label: '分组',
            children: [{ key: 'last', label: '最后一项' }],
          },
        ],
      },
    });
    const menuStyles = readFileSync(
      resolve(process.cwd(), 'src/components/menu/ExMenu.scss'),
      'utf8'
    );
    const itemStyles = readFileSync(
      resolve(process.cwd(), 'src/components/menu/ExMenuItem.scss'),
      'utf8'
    );

    expect(wrapper.findAll('.ex-submenu__arrow')).toHaveLength(1);
    expect(wrapper.get('.ex-menu-item').find('.ex-submenu__arrow').exists()).toBe(false);
    expect(`${menuStyles}\n${itemStyles}`).toContain('::marker');
    expect(`${menuStyles}\n${itemStyles}`).toMatch(/::marker\s*\{[\s\S]*?content:\s*['"]{2}/);
  });

  it('数据图标复用 ExIcon 且保持装饰语义', () => {
    const wrapper = mountMenu({
      props: {
        items: [{ key: 'home', label: '首页', icon: 'home-line' }],
      },
    });
    const icon = wrapper.get('.ex-menu-item__icon .ex-icon');

    expect(icon.attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.ex-menu-item__icon img').exists()).toBe(false);
  });

  it('非法数据在渲染前显式失败', () => {
    expect(() =>
      mountMenu({
        props: {
          items: [
            { key: 'duplicate', label: 'A' },
            { key: 'duplicate', label: 'B' },
          ],
        },
      })
    ).toThrow(/duplicate/);
  });

  it('搜索递归过滤并发出当前查询', async () => {
    const wrapper = mountMenu({
      props: {
        searchable: true,
        items: [
          {
            key: 'tools',
            label: '工具',
            children: [
              { key: 'editor', label: '编辑器' },
              { key: 'terminal', label: '终端' },
            ],
          },
          { key: 'settings', label: '设置' },
        ],
      },
    });

    await wrapper.get('input').setValue('终端');
    expect(wrapper.text()).toContain('工具');
    expect(wrapper.text()).toContain('终端');
    expect(wrapper.text()).not.toContain('编辑器');
    expect(wrapper.text()).not.toContain('设置');
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['终端']);

    await wrapper.get('input').setValue('');
    expect(wrapper.findAll('.ex-menu-item')).toHaveLength(3);
  });

  it('搜索隐藏当前激活项后仍应该保留一个可键盘聚焦项', async () => {
    const wrapper = mountMenu({
      props: {
        searchable: true,
        activeKey: 'settings',
        items: [
          { key: 'terminal', label: '终端' },
          { key: 'settings', label: '设置' },
        ],
      },
    });

    await wrapper.get('input').setValue('终端');
    await nextTick();

    expect(wrapper.get('.ex-menu-item__action').attributes('tabindex')).toBe('0');
  });

  it('非受控选择同步状态并提供完整事件信息', async () => {
    const items: MenuItem[] = [
      { key: 'one', label: '一' },
      { key: 'two', label: '二' },
    ];
    const wrapper = mountMenu({
      props: { items, defaultActiveKey: 'one' },
    });

    await wrapper.findAll('.ex-menu-item__action')[1].trigger('click');
    expect(wrapper.findAll('.ex-menu-item')[1].classes()).toContain('ex-menu-item--active');
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['two']);

    const selectInfo = wrapper.emitted('select')?.at(-1)?.[0] as MenuSelectInfo;
    const clickInfo = wrapper.emitted('item-click')?.at(-1)?.[0] as MenuSelectInfo;
    expect(selectInfo).toEqual(
      expect.objectContaining({ key: 'two', item: items[1], event: expect.any(MouseEvent) })
    );
    expect(clickInfo).toEqual(selectInfo);
  });

  it('受控 activeKey 只请求变更，不提前篡改可见状态', async () => {
    const wrapper = mountMenu({
      props: {
        activeKey: 'one',
        items: [
          { key: 'one', label: '一' },
          { key: 'two', label: '二' },
        ],
      },
    });

    await wrapper.findAll('.ex-menu-item__action')[1].trigger('click');
    expect(wrapper.findAll('.ex-menu-item')[0].classes()).toContain('ex-menu-item--active');
    expect(wrapper.findAll('.ex-menu-item')[1].classes()).not.toContain('ex-menu-item--active');
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['two']);

    await wrapper.setProps({ activeKey: 'two' });
    expect(wrapper.findAll('.ex-menu-item')[1].classes()).toContain('ex-menu-item--active');
  });

  it('selectable=false 仍发出真实点击，但不产生选择状态', async () => {
    const wrapper = mountMenu({
      props: {
        selectable: false,
        items: [{ key: 'one', label: '一' }],
      },
    });

    await wrapper.get('.ex-menu-item__action').trigger('click');
    expect(wrapper.emitted('item-click')).toHaveLength(1);
    expect(wrapper.emitted('select')).toBeUndefined();
    expect(wrapper.emitted('update:activeKey')).toBeUndefined();
    expect(wrapper.get('.ex-menu-item').classes()).not.toContain('ex-menu-item--active');
  });

  it('openKeys 同时遵守非受控默认值与受控单一事实来源', async () => {
    const items: MenuItem[] = [
      {
        key: 'group',
        label: '分组',
        children: [{ key: 'child', label: '子项' }],
      },
    ];
    const uncontrolled = mountMenu({ props: { items, defaultOpenKeys: ['group'] } });
    expect(uncontrolled.get('.ex-submenu').classes()).toContain('ex-submenu--open');
    await uncontrolled.get('.ex-submenu__title').trigger('click');
    expect(uncontrolled.get('.ex-submenu').classes()).not.toContain('ex-submenu--open');

    const controlled = mountMenu({ props: { items, openKeys: [] } });
    await controlled.get('.ex-submenu__title').trigger('click');
    expect(controlled.get('.ex-submenu').classes()).not.toContain('ex-submenu--open');
    expect(controlled.emitted('update:openKeys')?.at(-1)).toEqual([['group']]);
    expect(controlled.emitted('open-change')?.at(-1)).toEqual([['group']]);

    await controlled.setProps({ openKeys: ['group'] });
    expect(controlled.get('.ex-submenu').classes()).toContain('ex-submenu--open');
  });

  it('暴露方法沿用同一受控状态契约并返回防御性副本', async () => {
    const wrapper = mountMenu({
      props: { activeKey: 'one', openKeys: ['group'] },
    });
    const exposed = wrapper.vm as unknown as {
      getActiveKey: () => string | undefined;
      getOpenKeys: () => string[];
      setActiveKey: (key: string) => void;
      setOpenKeys: (keys: string[]) => void;
      getElement: () => HTMLElement | null;
    };

    const keys = exposed.getOpenKeys();
    keys.push('external');
    expect(exposed.getOpenKeys()).toEqual(['group']);
    exposed.setActiveKey('two');
    exposed.setOpenKeys(['next', 'next', '']);
    await nextTick();
    expect(exposed.getActiveKey()).toBe('one');
    expect(exposed.getOpenKeys()).toEqual(['group']);
    expect(wrapper.emitted('update:activeKey')?.at(-1)).toEqual(['two']);
    expect(wrapper.emitted('update:openKeys')?.at(-1)).toEqual([['next']]);
    expect(() => exposed.setActiveKey('')).toThrow(TypeError);
    expect(exposed.getElement()).toBe(wrapper.element);
  });

  it('折叠模式保留菜单项可访问名称节点', () => {
    const wrapper = mountMenu({
      props: { mode: 'inline', collapsed: true },
      slots: {
        default: () => h(ExMenuItem, { itemKey: 'dashboard' }, () => '控制台'),
      },
    });

    expect(wrapper.classes()).toContain('ex-menu--collapsed');
    expect(wrapper.get('.ex-menu-item__label').text()).toBe('控制台');
  });

  it('插槽子菜单沿用同一上下文', async () => {
    const wrapper = mountMenu({
      slots: {
        default: () =>
          h(
            ExSubMenu,
            { itemKey: 'more', title: '更多' },
            {
              default: () => h(ExMenuItem, { itemKey: 'about' }, () => '关于'),
            }
          ),
      },
    });

    await wrapper.get('.ex-submenu__title').trigger('click');
    expect(wrapper.classes()).toContain('ex-menu--vertical');
    expect(wrapper.get('.ex-submenu').classes()).toContain('ex-submenu--open');
  });
});
