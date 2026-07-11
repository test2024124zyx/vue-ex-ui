import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import ExMenu from '../../../src/components/menu/ExMenu.vue';
import ExMenuItem from '../../../src/components/menu/ExMenuItem.vue';

const wrappers: VueWrapper[] = [];

const track = (wrapper: VueWrapper): VueWrapper => {
  wrappers.push(wrapper);
  return wrapper;
};

const mountItems = (
  mode: 'horizontal' | 'vertical' | 'inline',
  items: Array<{ key: string; label: string; disabled?: boolean }>,
  activeKey?: string
): VueWrapper =>
  track(
    mount(ExMenu, {
      attachTo: document.body,
      props: { mode, activeKey },
      slots: {
        default: () =>
          items.map(item =>
            h(ExMenuItem, { itemKey: item.key, disabled: item.disabled }, () => item.label)
          ),
      },
    })
  );

describe('ExMenuItem', () => {
  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    document.body.innerHTML = '';
  });

  it('使用结构 li 与原生按钮分离菜单项语义', () => {
    const wrapper = track(
      mount(ExMenuItem, {
        props: { itemKey: 'profile' },
        slots: { default: '个人资料' },
      })
    );
    const action = wrapper.get('.ex-menu-item__action');

    expect(wrapper.element.tagName).toBe('LI');
    expect(wrapper.attributes('role')).toBe('none');
    expect(action.element.tagName).toBe('BUTTON');
    expect(action.attributes('type')).toBe('button');
    expect(action.attributes('role')).toBe('menuitem');
    expect(action.attributes('tabindex')).toBe('0');
  });

  it('href 使用原生安全锚点并保护新窗口来源', () => {
    const wrapper = track(
      mount(ExMenuItem, {
        props: {
          itemKey: 'docs',
          href: '  https://example.com/docs  ',
          target: '_blank',
          rel: 'external opener',
        },
        slots: { default: '文档' },
      })
    );
    const action = wrapper.get('.ex-menu-item__action');

    expect(action.element.tagName).toBe('A');
    expect(action.attributes('href')).toBe('https://example.com/docs');
    expect(action.attributes('target')).toBe('_blank');
    expect(action.attributes('rel')).toBe('external noopener');
  });

  it('危险 href 保持禁用锚点语义且不触发事件', async () => {
    const wrapper = track(
      mount(ExMenuItem, {
        props: { itemKey: 'unsafe', href: 'javascript:alert(1)' },
        slots: { default: '危险链接' },
      })
    );
    const action = wrapper.get('.ex-menu-item__action');

    expect(action.element.tagName).toBe('A');
    expect(action.attributes('href')).toBeUndefined();
    expect(action.attributes('aria-disabled')).toBe('true');
    expect(action.attributes('tabindex')).toBe('-1');
    await action.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('disabled 使用原生按钮禁用并阻断选择', async () => {
    const wrapper = track(
      mount(ExMenuItem, {
        props: { itemKey: 'disabled', disabled: true },
        slots: { default: '禁用项' },
      })
    );
    const action = wrapper.get('button');

    expect(action.attributes('disabled')).toBeDefined();
    expect(action.attributes('aria-disabled')).toBe('true');
    expect(wrapper.classes()).toContain('ex-menu-item--disabled');
    await action.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('根属性与动作无障碍属性各自落到正确元素，旧 path 不泄漏', () => {
    const wrapper = track(
      mount(ExMenuItem, {
        props: { itemKey: 'settings' },
        attrs: {
          class: 'settings-item',
          style: { marginTop: '4px' },
          'data-track-id': 'settings',
          'aria-label': '系统设置',
          path: '/settings',
        },
      })
    );

    expect(wrapper.classes()).toContain('settings-item');
    expect(wrapper.attributes('style')).toContain('margin-top: 4px');
    expect(wrapper.attributes('data-track-id')).toBe('settings');
    expect(wrapper.attributes('path')).toBeUndefined();
    expect(wrapper.get('.ex-menu-item__action').attributes('aria-label')).toBe('系统设置');
    expect(wrapper.get('.ex-menu-item__action').attributes('path')).toBeUndefined();
  });

  it('激活项维护 aria-current 与唯一 Tab 停靠点', () => {
    const wrapper = mountItems(
      'vertical',
      [
        { key: 'one', label: '一' },
        { key: 'two', label: '二' },
      ],
      'two'
    );
    const actions = wrapper.findAll('.ex-menu-item__action');

    expect(actions[0].attributes('tabindex')).toBe('-1');
    expect(actions[1].attributes('tabindex')).toBe('0');
    expect(actions[1].attributes('aria-current')).toBe('page');
  });

  it('无激活项时首个非禁用项成为唯一 Tab 停靠点', () => {
    const wrapper = mountItems('vertical', [
      { key: 'disabled', label: '禁用', disabled: true },
      { key: 'one', label: '一' },
      { key: 'two', label: '二' },
    ]);
    const actions = wrapper.findAll('.ex-menu-item__action');

    expect(actions.map(action => action.attributes('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('水平菜单左右键循环并跳过禁用项', async () => {
    const wrapper = mountItems('horizontal', [
      { key: 'one', label: '一' },
      { key: 'disabled', label: '禁用', disabled: true },
      { key: 'three', label: '三' },
    ]);
    const actions = wrapper.findAll('.ex-menu-item__action');

    (actions[0].element as HTMLElement).focus();
    await actions[0].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(actions[2].element);
    expect(actions[2].attributes('tabindex')).toBe('0');

    await actions[2].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(actions[0].element);
    await actions[0].trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(actions[2].element);
  });

  it('垂直菜单上下键与 Home/End 在当前层级移动焦点', async () => {
    const wrapper = mountItems('vertical', [
      { key: 'one', label: '一' },
      { key: 'two', label: '二' },
      { key: 'three', label: '三' },
    ]);
    const actions = wrapper.findAll('.ex-menu-item__action');

    (actions[1].element as HTMLElement).focus();
    await actions[1].trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(actions[2].element);
    await actions[2].trigger('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(actions[1].element);
    await actions[1].trigger('keydown', { key: 'Home' });
    expect(document.activeElement).toBe(actions[0].element);
    await actions[0].trigger('keydown', { key: 'End' });
    expect(document.activeElement).toBe(actions[2].element);
  });

  it('点击事件提供键与原生 MouseEvent，暴露结构根元素', async () => {
    const wrapper = track(
      mount(ExMenuItem, {
        props: { itemKey: 'profile' },
        slots: { default: '个人资料' },
      })
    );
    await wrapper.get('button').trigger('click');

    expect(wrapper.emitted('click')?.[0][0]).toBe('profile');
    expect(wrapper.emitted('click')?.[0][1]).toBeInstanceOf(MouseEvent);
    const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };
    expect(exposed.getElement()).toBe(wrapper.element);
  });
});
