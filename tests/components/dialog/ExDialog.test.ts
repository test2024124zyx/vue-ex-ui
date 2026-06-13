import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExDialog from '../../../src/components/dialog/ExDialog.vue';

// 这些用例同时验证 ExDialog 与 ExModal 共用的 useOverlay 机制（打开/关闭/Esc/守卫）

describe('ExDialog', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    // 释放 useOverlay 可能残留的 body 滚动锁
    document.body.style.overflow = '';
  });

  it('renders the dialog when modelValue is true', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Hello' },
    });
    await nextTick();
    expect(document.querySelector('.ex-dialog')).toBeTruthy();
    expect(document.querySelector('.ex-dialog__title')?.textContent).toContain('Hello');
    wrapper.unmount();
  });

  it('does not render when modelValue is false', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: false },
    });
    await nextTick();
    expect(document.querySelector('.ex-dialog')).toBeFalsy();
    wrapper.unmount();
  });

  it('emits open when opened', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true },
    });
    await flushPromises();
    expect(wrapper.emitted('open')).toBeTruthy();
    wrapper.unmount();
  });

  it('closes on Escape when closeOnPressEscape (default)', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true },
    });
    await flushPromises();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });

  it('does not close on Escape when closeOnPressEscape is false', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, closeOnPressEscape: false },
    });
    await flushPromises();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    wrapper.unmount();
  });

  it('closes when the close button is clicked', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, title: 'X' },
    });
    await flushPromises();

    (document.querySelector('.ex-dialog__close') as HTMLElement)?.click();
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });

  it('respects beforeClose guard (escape blocked)', async () => {
    const beforeClose = vi.fn().mockResolvedValue(false);
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, beforeClose },
    });
    await flushPromises();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();

    expect(beforeClose).toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    wrapper.unmount();
  });

  it('exposes open/close methods', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: false },
    });
    const vm = wrapper.vm as unknown as { open: () => void; close: () => void };

    vm.open();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);

    vm.close();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });
});
