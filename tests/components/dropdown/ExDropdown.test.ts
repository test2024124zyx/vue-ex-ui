import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExDropdown from '../../../src/components/dropdown/ExDropdown.vue';
import type { DropdownItemData } from '../../../src/components/dropdown/types';

describe('ExDropdown', () => {
  const items: DropdownItemData[] = [
    { key: '1', label: '编辑' },
    { key: '2', label: '复制', disabled: true },
    { key: '3', label: '删除' },
  ];

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const mountDropdown = (props = {}) =>
    mount(ExDropdown, {
      props: { items, trigger: 'click', ...props },
      slots: { default: '<button>菜单</button>' },
    });

  describe('基础渲染与无障碍', () => {
    it('应该正确渲染触发器', () => {
      const wrapper = mountDropdown();
      expect(wrapper.find('.ex-dropdown').exists()).toBe(true);
      expect(wrapper.find('.ex-dropdown__trigger').exists()).toBe(true);
    });

    it('触发器应具备键盘可达性与 ARIA 属性', () => {
      const wrapper = mountDropdown();
      const trigger = wrapper.find('.ex-dropdown__trigger');
      expect(trigger.attributes('role')).toBe('button');
      expect(trigger.attributes('tabindex')).toBe('0');
      expect(trigger.attributes('aria-haspopup')).toBe('menu');
      expect(trigger.attributes('aria-expanded')).toBe('false');
    });

    it('禁用时 tabindex 应为 -1', () => {
      const wrapper = mountDropdown({ disabled: true });
      expect(wrapper.find('.ex-dropdown__trigger').attributes('tabindex')).toBe('-1');
    });
  });

  describe('键盘导航', () => {
    it('ArrowDown 应打开菜单并高亮首个可用项', async () => {
      const wrapper = mountDropdown();
      await wrapper.find('.ex-dropdown__trigger').trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(wrapper.emitted('show')).toBeTruthy();
      expect(wrapper.find('.ex-dropdown__trigger').attributes('aria-expanded')).toBe('true');
      const active = document.querySelector('.ex-dropdown-item--active');
      expect(active?.textContent).toContain('编辑');
    });

    it('ArrowDown 应跳过禁用项', async () => {
      const wrapper = mountDropdown();
      const trigger = wrapper.find('.ex-dropdown__trigger');
      await trigger.trigger('keydown', { key: 'ArrowDown' }); // 高亮 "编辑"
      await trigger.trigger('keydown', { key: 'ArrowDown' }); // 跳过禁用的"复制"到"删除"
      await nextTick();
      const active = document.querySelector('.ex-dropdown-item--active');
      expect(active?.textContent).toContain('删除');
    });

    it('Enter 应选中当前高亮项并触发 item-click', async () => {
      const wrapper = mountDropdown();
      const trigger = wrapper.find('.ex-dropdown__trigger');
      await trigger.trigger('keydown', { key: 'ArrowDown' });
      await trigger.trigger('keydown', { key: 'Enter' });
      const emitted = wrapper.emitted('item-click');
      expect(emitted).toBeTruthy();
      expect((emitted![0][0] as DropdownItemData).key).toBe('1');
    });

    it('Escape 应关闭菜单', async () => {
      const wrapper = mountDropdown();
      const trigger = wrapper.find('.ex-dropdown__trigger');
      await trigger.trigger('keydown', { key: 'ArrowDown' });
      await trigger.trigger('keydown', { key: 'Escape' });
      const hideEvents = wrapper.emitted('update:visible');
      expect(hideEvents).toBeTruthy();
      expect(hideEvents![hideEvents!.length - 1][0]).toBe(false);
    });
  });

  describe('菜单项 ARIA', () => {
    it('渲染的菜单项应带有 role=menuitem', async () => {
      const wrapper = mountDropdown();
      await wrapper.find('.ex-dropdown__trigger').trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      const menuitems = document.querySelectorAll('[role="menuitem"]');
      expect(menuitems.length).toBe(items.length);
    });

    it('禁用项应标记 aria-disabled', async () => {
      const wrapper = mountDropdown();
      await wrapper.find('.ex-dropdown__trigger').trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      const disabled = document.querySelector('.ex-dropdown-item--disabled');
      expect(disabled?.getAttribute('aria-disabled')).toBe('true');
    });
  });
});
