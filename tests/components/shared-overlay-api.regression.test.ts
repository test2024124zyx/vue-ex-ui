import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { h, type Component } from 'vue';
import ExDialog from '../../src/components/dialog/ExDialog.vue';
import ExDrawer from '../../src/components/drawer/ExDrawer.vue';
import ExModal from '../../src/components/modal/ExModal.vue';

enableAutoUnmount(afterEach);

describe('弹层公共关闭与确认接口', () => {
  it.each([
    ['Modal', ExModal, { keyboard: true }],
    ['Dialog', ExDialog, { modal: true, confirmText: '旧按钮' }],
    ['Drawer', ExDrawer, { closable: true }],
  ] as const)('%s 接受统一属性', async (_name, component, legacy) => {
    const wrapper = mount(component as Component, {
      props: {
        ...legacy,
        modelValue: true,
        mask: false,
        showClose: false,
        closeOnPressEscape: false,
        showFooter: true,
        okText: '新按钮',
        customClass: 'common-panel',
      },
      slots: { default: '内容' },
      attachTo: document.body,
    });
    await flushPromises();
    const panel = document.body.querySelector('[role="dialog"]')!;
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('aria-modal')).toBeNull();
    expect(panel.closest('.common-panel')).not.toBeNull();
    expect(panel.querySelector('[class$="__close"]')).toBeNull();
    expect(panel.textContent).toContain('新按钮');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flushPromises();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it.each([
    ['Modal', ExModal],
    ['Dialog', ExDialog],
    ['Drawer', ExDrawer],
  ] as const)('%s 确认事件与关闭图标插槽可共用', async (name, component) => {
    const wrapper = mount(component as Component, {
      props: { modelValue: true, showFooter: true, okText: '确认操作' },
      slots: { closeIcon: () => h('span', { 'data-test': 'custom-close-icon' }, '关闭图标') },
      attachTo: document.body,
    });
    await flushPromises();
    expect(document.body.querySelector('[data-test="custom-close-icon"]')).toBeTruthy();
    const action = [...document.body.querySelectorAll('button')].find(button =>
      button.textContent?.includes('确认操作')
    )!;
    action.click();
    await flushPromises();
    expect(wrapper.emitted('confirm')).toEqual([[]]);
    if (name !== 'Dialog') expect(wrapper.emitted('ok')).toEqual([[]]);
  });
});
