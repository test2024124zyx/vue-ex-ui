import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted } from 'vue';
import ExDrawer from '../../../src/components/drawer/ExDrawer.vue';
import type { ExDrawerExposed } from '../../../src/components/drawer/types';

describe('ExDrawer', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    vi.restoreAllMocks();
  });

  const mountDrawer = (props: Record<string, unknown> = {}, slots = {}, attrs = {}) => {
    wrapper = mount(ExDrawer, { props, slots, attrs, attachTo: document.body });
    return wrapper;
  };

  it('渲染标题、遮罩与正确的对话框标记', async () => {
    mountDrawer({ modelValue: true, title: '抽屉标题' });
    await flushPromises();
    const drawer = document.querySelector('.ex-drawer')!;
    const title = document.querySelector('.ex-drawer__title')!;
    expect(document.querySelector('.ex-drawer-mask')).toBeTruthy();
    expect(drawer.getAttribute('role')).toBe('dialog');
    expect(drawer.getAttribute('aria-modal')).toBe('true');
    expect(drawer.getAttribute('aria-labelledby')).toBe(title.id);
    expect(drawer.hasAttribute('aria-label')).toBe(false);
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)('应用 %s 方向样式', async placement => {
    mountDrawer({ modelValue: true, placement });
    await flushPromises();
    expect(document.querySelector('.ex-drawer')?.classList).toContain(`ex-drawer--${placement}`);
  });

  it.each([
    ['small', '300px'],
    ['medium', '500px'],
    ['large', '800px'],
    ['extra-large', '1000px'],
    [600, '600px'],
    ['50%', '50%'],
  ])('将尺寸 %s 转换为 %s', async (size, expected) => {
    mountDrawer({ modelValue: true, size });
    await flushPromises();
    expect((document.querySelector('.ex-drawer') as HTMLElement).style.width).toBe(expected);
  });

  it('非有限或非正数字尺寸回退到 medium', async () => {
    mountDrawer({ modelValue: true, size: Number.POSITIVE_INFINITY });
    await flushPromises();
    expect((document.querySelector('.ex-drawer') as HTMLElement).style.width).toBe('500px');
  });

  it('遮罩点击经过 beforeClose 守卫请求关闭', async () => {
    const beforeClose = vi.fn().mockResolvedValue(true);
    mountDrawer({ modelValue: true, beforeClose });
    await flushPromises();
    (document.querySelector('.ex-drawer-mask') as HTMLElement).click();
    await flushPromises();
    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('maskClosable=false 时遮罩不请求关闭', async () => {
    mountDrawer({ modelValue: true, maskClosable: false });
    await flushPromises();
    (document.querySelector('.ex-drawer-mask') as HTMLElement).click();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('Escape 与关闭按钮可独立配置', async () => {
    mountDrawer({ modelValue: true, closable: false, closeOnPressEscape: true });
    await flushPromises();
    expect(document.querySelector('.ex-drawer__close')).toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('closeOnPressEscape=false 时忽略 Escape', async () => {
    mountDrawer({ modelValue: true, closeOnPressEscape: false });
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('初始 beforeOpen 未通过前不渲染抽屉', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeOpen = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    mountDrawer({ modelValue: true, beforeOpen });
    await nextTick();
    expect(document.querySelector('.ex-drawer')).toBeNull();

    resolveGuard?.(true);
    await flushPromises();
    expect(document.querySelector('.ex-drawer')).toBeTruthy();
    expect(wrapper!.emitted('open')).toEqual([[]]);
  });

  it('过期 beforeOpen 结果不会重新打开已由外部关闭的抽屉', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeOpen = () => new Promise<boolean>(resolve => (resolveGuard = resolve));
    mountDrawer({ modelValue: false, beforeOpen });
    await wrapper!.setProps({ modelValue: true });
    await wrapper!.setProps({ modelValue: false });
    resolveGuard?.(true);
    await flushPromises();
    expect(document.querySelector('.ex-drawer')).toBeNull();
  });

  it('并发关闭请求只执行一次 beforeClose', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeClose = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    mountDrawer({ modelValue: true, beforeClose });
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    (document.querySelector('.ex-drawer-mask') as HTMLElement).click();
    expect(beforeClose).toHaveBeenCalledTimes(1);
    resolveGuard?.(false);
    await flushPromises();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('destroyOnClose=false 时保留插槽组件实例', async () => {
    const mounted = vi.fn();
    const Child = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h('input', { class: 'drawer-stateful-child' });
      },
    });
    mountDrawer({ modelValue: false, destroyOnClose: false }, { default: () => h(Child) });
    await wrapper!.setProps({ modelValue: true });
    await flushPromises();
    await wrapper!.setProps({ modelValue: false });
    await flushPromises();
    await wrapper!.setProps({ modelValue: true });
    await flushPromises();
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('mask=false 时包装器不拦截背景且不声明 aria-modal', async () => {
    mountDrawer({ modelValue: true, mask: false });
    await flushPromises();
    expect(document.querySelector('.ex-drawer-wrapper')?.classList).toContain(
      'ex-drawer-wrapper--modeless'
    );
    expect(document.querySelector('.ex-drawer')?.hasAttribute('aria-modal')).toBe(false);
  });

  it('默认 footer 发出 ok/cancel，禁用状态透传到按钮', async () => {
    mountDrawer({
      modelValue: true,
      showFooter: true,
      okDisabled: true,
      cancelDisabled: true,
    });
    await flushPromises();
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.ex-drawer__footer button')
    );
    expect(buttons).toHaveLength(2);
    expect(buttons.every(button => button.disabled)).toBe(true);
  });

  it('支持标题、内容与底部插槽', async () => {
    mountDrawer(
      { modelValue: true },
      {
        title: () => h('span', { class: 'custom-title' }, '标题'),
        default: () => h('div', { class: 'custom-content' }, '内容'),
        footer: () => h('div', { class: 'custom-footer' }, '底部'),
      }
    );
    await flushPromises();
    expect(document.querySelector('.custom-title')).toBeTruthy();
    expect(document.querySelector('.custom-content')).toBeTruthy();
    expect(document.querySelector('.custom-footer')).toBeTruthy();
  });

  it('自定义类、样式、层级和原生属性分别应用到正确元素', async () => {
    mountDrawer(
      {
        modelValue: true,
        customClass: 'custom-drawer',
        customStyle: { maxWidth: '90vw' },
        zIndex: 2000,
      },
      {},
      { 'data-testid': 'drawer-root' }
    );
    await flushPromises();
    const root = document.querySelector<HTMLElement>('.ex-drawer-wrapper')!;
    const panel = document.querySelector<HTMLElement>('.ex-drawer')!;
    expect(root.dataset.testid).toBe('drawer-root');
    expect(root.style.zIndex).toBe('2000');
    expect(panel.classList).toContain('custom-drawer');
    expect(panel.style.maxWidth).toBe('90vw');
  });

  it('公开 open/close 使用受控更新与统一守卫，并返回面板元素', async () => {
    const beforeClose = vi.fn().mockResolvedValue(false);
    mountDrawer({ modelValue: true, beforeClose });
    await flushPromises();
    const exposed = wrapper!.vm as unknown as ExDrawerExposed;
    expect(exposed.getElement()).toBe(document.querySelector('.ex-drawer'));
    await exposed.close();
    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
    exposed.open();
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([true]);
  });
});
