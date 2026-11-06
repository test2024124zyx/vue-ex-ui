import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import Modal from '../../../src/components/modal/ExModal.vue';
import Menu from '../../../src/components/menu/ExMenu.vue';

enableAutoUnmount(afterEach);
afterEach(() => {
  document.body.innerHTML = '';
});
const items = [{ key: 'g', label: 'Group', children: [{ key: 'l', label: 'Leaf' }] }];

it('闭合祖先中的活动项不夺走可见菜单的 Tab 入口', async () => {
  const wrapper = mount(Menu, { props: { mode: 'inline', defaultActiveKey: 'l', items } });
  await nextTick();
  expect(wrapper.findAll('[tabindex="0"]').some(item => !item.element.closest('[inert]'))).toBe(
    true
  );
  wrapper.vm.setOpenKeys(['g']);
  await nextTick();
  expect(wrapper.get('[data-menu-key="l"]').attributes('tabindex')).toBe('0');
  wrapper.vm.setOpenKeys([]);
  await nextTick();
  expect(wrapper.get('[data-menu-key="g"]').attributes('tabindex')).toBe('0');
});

it('Modal 中的 inline Menu 先消费 Escape，第二次才关闭父弹窗', async () => {
  const close = vi.fn();
  mount(Modal, {
    props: { modelValue: true, 'onUpdate:modelValue': close },
    slots: { default: () => h(Menu, { mode: 'inline', defaultOpenKeys: ['g'], items }) },
    attachTo: document.body,
  });
  await nextTick();
  await nextTick();
  const title = document.querySelector<HTMLElement>('.ex-submenu__title')!;
  title.focus();
  title.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await nextTick();
  expect(close).not.toHaveBeenCalled();
  expect(title.getAttribute('aria-expanded')).toBe('false');
  title.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await nextTick();
  expect(close).toHaveBeenCalledTimes(1);
});
