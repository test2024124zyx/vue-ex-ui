import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted } from 'vue';
import ExDialog from '../../../src/components/dialog/ExDialog.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';

// 这些用例同时验证 ExDialog 与 ExModal 共用的 useOverlay 机制（打开/关闭/Esc/守卫）

describe('ExDialog', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    // 释放 useOverlay 可能残留的 body 滚动锁
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    vi.restoreAllMocks();
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
    const vm = wrapper.vm as unknown as { open: () => void; close: () => Promise<boolean> };

    vm.open();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);

    await vm.close();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });

  it('点击真实遮罩节点会请求关闭', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true },
    });
    await flushPromises();

    (document.querySelector('.ex-dialog-modal') as HTMLElement).click();
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });

  it('标题插槽为 dialog 提供 aria-labelledby 且不重复 aria-label', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true },
      slots: { title: () => '插槽标题' },
    });
    await flushPromises();
    const dialog = document.querySelector('.ex-dialog')!;
    const title = document.querySelector('.ex-dialog__title')!;

    expect(title.id).toBeTruthy();
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.hasAttribute('aria-label')).toBe(false);
    wrapper.unmount();
  });

  it('beforeOpen 未完成时外部关闭会取消过期的打开结果', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeOpen = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: false, beforeOpen },
    });

    await wrapper.setProps({ modelValue: true });
    await wrapper.setProps({ modelValue: false });
    resolveGuard?.(true);
    await flushPromises();

    expect(document.querySelector('.ex-dialog')).toBeNull();
    expect(wrapper.emitted('open')).toBeUndefined();
    wrapper.unmount();
  });

  it('并发关闭请求只执行一次 beforeClose', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeClose = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, beforeClose },
    });
    await flushPromises();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(beforeClose).toHaveBeenCalledTimes(1);

    resolveGuard?.(false);
    await flushPromises();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    wrapper.unmount();
  });

  it('异步关闭期间重复点击取消只发出一次业务事件', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeClose = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, beforeClose },
    });
    await flushPromises();
    const cancel = document.querySelector<HTMLButtonElement>('.ex-dialog__footer button');

    cancel?.click();
    cancel?.click();
    await nextTick();

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(beforeClose).toHaveBeenCalledTimes(1);
    resolveGuard?.(false);
    await flushPromises();
    wrapper.unmount();
  });

  it('原生属性透传到语义面板而不是定位包装器', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true },
      attrs: { 'data-testid': 'dialog-panel', 'aria-describedby': 'dialog-description' },
    });
    await flushPromises();
    const panel = document.querySelector('.ex-dialog')!;
    const root = document.querySelector('.ex-dialog-wrapper')!;

    expect(panel.getAttribute('data-testid')).toBe('dialog-panel');
    expect(panel.getAttribute('aria-describedby')).toBe('dialog-description');
    expect(root.hasAttribute('data-testid')).toBe(false);
    wrapper.unmount();
  });

  it('无标题时使用本地化的兜底无障碍名称', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, showClose: false },
    });
    await flushPromises();

    expect(document.querySelector('.ex-dialog')?.getAttribute('aria-label')).toBe('Dialog');
    wrapper.unmount();
  });

  it('公开 close 方法与界面关闭入口使用同一 beforeClose 守卫', async () => {
    const beforeClose = vi.fn().mockResolvedValue(false);
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, beforeClose },
    });
    await flushPromises();

    await (wrapper.vm as unknown as { close: () => Promise<boolean> }).close();

    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    wrapper.unmount();
  });

  it('destroyOnClose=false 时关闭再打开不会重新挂载插槽内容', async () => {
    const mounted = vi.fn();
    const StatefulChild = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h('input', { class: 'stateful-child' });
      },
    });
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: false, destroyOnClose: false },
      slots: { default: () => h(StatefulChild) },
    });

    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    await wrapper.setProps({ modelValue: false });
    await flushPromises();
    await wrapper.setProps({ modelValue: true });
    await flushPromises();

    expect(mounted).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('默认按钮均隐藏时不渲染空 footer', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, showConfirm: false, showCancel: false },
    });
    await flushPromises();
    expect(document.querySelector('.ex-dialog__footer')).toBeNull();
    wrapper.unmount();
  });

  it('modal=false 时标记为非阻塞包装器', async () => {
    const wrapper = mount(ExDialog, {
      attachTo: document.body,
      props: { modelValue: true, modal: false },
    });
    await flushPromises();
    expect(document.querySelector('.ex-dialog-wrapper')?.classList).toContain(
      'ex-dialog-wrapper--modeless'
    );
    expect(document.querySelector('.ex-dialog')?.hasAttribute('aria-modal')).toBe(false);
    wrapper.unmount();
  });

  it('Teleport 包装器继承 ConfigProvider 的语义层级和效果开关', async () => {
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { zIndex: 2400, neonEffect: false, animation: false },
      slots: { default: () => h(ExDialog, { modelValue: true, title: '标题' }) },
    });
    await flushPromises();

    const root = document.querySelector<HTMLElement>('.ex-dialog-wrapper')!;
    expect(root.style.zIndex).toBe('2450');
    expect(root.classList).toContain('ex-no-neon');
    expect(root.classList).toContain('ex-no-animation');
    wrapper.unmount();
  });
});
