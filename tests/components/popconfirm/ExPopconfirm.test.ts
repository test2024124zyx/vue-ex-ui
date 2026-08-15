import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExPopconfirm from '../../../src/components/popconfirm/ExPopconfirm.vue';

// 回归测试：此前 ExPopconfirm 用 v-model:visible / popup-class 绑定 ExPopover，
// 而 ExPopover 实际是 modelValue / customClass，导致确认/取消按钮无法关闭气泡。

describe('ExPopconfirm', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 必须卸载，否则 ExPopover 在 mount 时挂载的全局 click 监听会跨用例泄漏
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  const mountPC = (props: Record<string, unknown> = {}) => {
    wrapper = mount(ExPopconfirm, {
      props: { title: '确认删除？', ...props },
      slots: { default: '<button class="trigger">删除</button>' },
      attachTo: document.body,
    });
    return wrapper;
  };

  const footerButtons = () =>
    document.querySelectorAll<HTMLElement>('.ex-popconfirm__footer button');

  it('点击触发元素应打开确认框', async () => {
    const wrapper = mountPC();
    await wrapper.trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-popconfirm')).toBeTruthy();
  });

  it('点击确认按钮应触发 confirm 并关闭气泡', async () => {
    const wrapper = mountPC();
    await wrapper.trigger('click');
    await nextTick();

    const buttons = footerButtons();
    buttons[buttons.length - 1]!.click(); // 确认按钮
    await nextTick();

    expect(wrapper.emitted('confirm')).toBeTruthy();

    // ExPopover hide() 有 closeDelay（默认 200ms）
    vi.advanceTimersByTime(300);
    await nextTick();
    expect(document.querySelector('.ex-popconfirm')).toBeFalsy();
  });

  it('点击取消按钮应触发 cancel 并关闭气泡', async () => {
    const wrapper = mountPC();
    await wrapper.trigger('click');
    await nextTick();

    footerButtons()[0]!.click(); // 取消按钮
    await nextTick();

    expect(wrapper.emitted('cancel')).toBeTruthy();

    vi.advanceTimersByTime(300);
    await nextTick();
    expect(document.querySelector('.ex-popconfirm')).toBeFalsy();
  });

  it('beforeConfirm 返回 false 时不关闭', async () => {
    const wrapper = mountPC({ beforeConfirm: () => false });
    await wrapper.trigger('click');
    await nextTick();

    const buttons = footerButtons();
    buttons[buttons.length - 1]!.click();
    await nextTick();
    vi.advanceTimersByTime(300);
    await nextTick();

    expect(wrapper.emitted('confirm')).toBeFalsy();
    expect(document.querySelector('.ex-popconfirm')).toBeTruthy();
  });

  it('自定义浮层类名应透传到 ExPopover', async () => {
    const wrapper = mountPC({ popupClass: 'my-popup' });
    await wrapper.trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-popover__popper.my-popup')).toBeTruthy();
  });

  it('异步确认期间重复点击只应该执行一次 beforeConfirm', async () => {
    let resolveConfirm: ((value: boolean) => void) | undefined;
    const beforeConfirm = vi.fn(() => new Promise<boolean>(resolve => (resolveConfirm = resolve)));
    const wrapper = mountPC({ beforeConfirm });
    await wrapper.trigger('click');
    await nextTick();
    const confirmButton = footerButtons()[footerButtons().length - 1]!;

    confirmButton.click();
    confirmButton.click();
    await nextTick();

    expect(beforeConfirm).toHaveBeenCalledOnce();
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);

    resolveConfirm?.(true);
    await Promise.resolve();
    await nextTick();
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('beforeConfirm 拒绝时应该保持打开并通过事件报告错误', async () => {
    const error = new Error('network failed');
    const wrapper = mountPC({ beforeConfirm: () => Promise.reject(error) });
    await wrapper.trigger('click');
    await nextTick();

    footerButtons()[footerButtons().length - 1]!.click();
    await Promise.resolve();
    await Promise.resolve();
    await nextTick();

    expect(wrapper.emitted('confirm')).toBeUndefined();
    expect(wrapper.emitted('confirm-error')?.at(-1)).toEqual([error]);
    expect(document.querySelector('.ex-popconfirm')).toBeTruthy();
  });

  it('确认对话框应该使用标题作为可访问名称', async () => {
    const wrapper = mountPC({ title: '确认删除项目？' });
    await wrapper.trigger('click');
    await nextTick();

    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe(
      '确认删除项目？'
    );
  });
});
