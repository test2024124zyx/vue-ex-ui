import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, onMounted } from 'vue';
import ExModal from '../../../src/components/modal/ExModal.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ExModalExposed } from '../../../src/components/modal/types';
import { setLocale } from '../../../src/locale';

describe('ExModal', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  beforeEach(() => {
    setLocale('zh-CN');
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    setLocale('en-US');
    vi.restoreAllMocks();
  });

  const mountModal = (props: Record<string, unknown> = {}, slots = {}, attrs = {}) => {
    wrapper = mount(ExModal, { props, slots, attrs, attachTo: document.body });
    return wrapper;
  };

  it('使用标题元素提供唯一的可访问名称', async () => {
    mountModal({ modelValue: true, title: '确认操作' });
    await flushPromises();
    const modal = document.querySelector('.ex-modal')!;
    const title = document.querySelector('.ex-modal-title')!;
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(modal.getAttribute('aria-labelledby')).toBe(title.id);
    expect(modal.hasAttribute('aria-label')).toBe(false);
  });

  it('标题插槽同样参与 aria-labelledby', async () => {
    mountModal({ modelValue: true }, { title: () => h('span', '插槽标题') });
    await flushPromises();
    const modal = document.querySelector('.ex-modal')!;
    expect(modal.getAttribute('aria-labelledby')).toBe(
      document.querySelector('.ex-modal-title')?.id
    );
  });

  it('原生 aria-label 覆盖标题关联且透传到语义面板', async () => {
    mountModal(
      { modelValue: true, title: '标题' },
      {},
      {
        id: 'confirm-modal',
        class: 'product-modal',
        style: { maxHeight: '80vh' },
        'aria-label': '自定义名称',
        'aria-describedby': 'confirm-description',
        'data-track-id': 'confirm',
      }
    );
    await flushPromises();
    const modal = document.querySelector<HTMLElement>('.ex-modal')!;
    const root = document.querySelector<HTMLElement>('.ex-modal-root')!;

    expect(modal.id).toBe('confirm-modal');
    expect(modal.classList).toContain('product-modal');
    expect(modal.style.maxHeight).toBe('80vh');
    expect(modal.getAttribute('aria-label')).toBe('自定义名称');
    expect(modal.hasAttribute('aria-labelledby')).toBe(false);
    expect(modal.getAttribute('aria-describedby')).toBe('confirm-description');
    expect(modal.dataset.trackId).toBe('confirm');
    expect(root.id).toBe('');
    expect(root.hasAttribute('aria-label')).toBe(false);
  });

  it('过滤已删除 ariaLabel 伪属性并为无标题面板提供本地化名称', async () => {
    mountModal({ modelValue: true }, {}, { ariaLabel: '旧标签' });
    await flushPromises();
    const modal = document.querySelector('.ex-modal')!;

    expect(modal.getAttribute('aria-label')).toBe('对话框');
    expect(modal.hasAttribute('arialabel')).toBe(false);
    expect(document.querySelector('.ex-modal-root')?.hasAttribute('arialabel')).toBe(false);
  });

  it('尊重外部 aria-labelledby 并规范 alertdialog 角色', async () => {
    mountModal(
      { modelValue: true, title: '内部标题' },
      {},
      { role: 'alertdialog', 'aria-labelledby': 'external-title' }
    );
    await flushPromises();
    const modal = document.querySelector('.ex-modal')!;

    expect(modal.getAttribute('role')).toBe('alertdialog');
    expect(modal.getAttribute('aria-labelledby')).toBe('external-title');
    expect(modal.hasAttribute('aria-label')).toBe(false);
  });

  it('只有图标时不渲染空标题', async () => {
    mountModal({ modelValue: true }, { icon: () => h('span', { class: 'status-icon' }) });
    await flushPromises();
    expect(document.querySelector('.status-icon')).toBeTruthy();
    expect(document.querySelector('.ex-modal-title')).toBeNull();
  });

  it('空白标题、图标与 footer 插槽不产生伪布局结构', async () => {
    mountModal(
      { modelValue: true, showClose: false },
      {
        title: () => '   ',
        icon: () => null,
        footer: () => '  ',
      }
    );
    await flushPromises();

    expect(document.querySelector('.ex-modal-header')).toBeNull();
    expect(document.querySelector('.ex-modal-title')).toBeNull();
    expect(document.querySelector('.ex-modal-footer')).toBeNull();
    expect(document.querySelector('.ex-modal')?.getAttribute('aria-label')).toBe('对话框');
  });

  it('无标题时仍为关闭按钮保留结构化头部', async () => {
    mountModal({ modelValue: true });
    await flushPromises();

    expect(document.querySelector('.ex-modal-header .ex-modal-close')).toBeTruthy();
  });

  it('无遮罩时不声明模态语义、不锁定滚动且不拦截背景', async () => {
    mountModal({ modelValue: true, mask: false });
    await flushPromises();
    expect(document.querySelector('.ex-modal-root')?.classList).toContain(
      'ex-modal-root--modeless'
    );
    expect(document.querySelector('.ex-modal')?.hasAttribute('aria-modal')).toBe(false);
    expect(document.querySelector('.ex-modal-mask')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('遮罩点击经 beforeClose 守卫请求关闭并发出 cancel', async () => {
    const beforeClose = vi.fn().mockResolvedValue(true);
    mountModal({ modelValue: true, beforeClose });
    await flushPromises();
    (document.querySelector('.ex-modal-mask') as HTMLElement).click();
    await flushPromises();
    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper!.emitted('cancel')).toEqual([[]]);
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('maskClosable=false 时遮罩与空白区都不关闭', async () => {
    mountModal({ modelValue: true, maskClosable: false });
    await flushPromises();
    (document.querySelector('.ex-modal-mask') as HTMLElement).click();
    (document.querySelector('.ex-modal-wrap') as HTMLElement).click();
    expect(wrapper!.emitted('cancel')).toBeUndefined();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('Escape 与关闭按钮可独立配置', async () => {
    mountModal({ modelValue: true, showClose: false, keyboard: true });
    await flushPromises();
    expect(document.querySelector('.ex-modal-close')).toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();
    expect(wrapper!.emitted('cancel')).toEqual([[]]);
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('keyboard=false 时忽略 Escape', async () => {
    mountModal({ modelValue: true, keyboard: false });
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper!.emitted('cancel')).toBeUndefined();
  });

  it('并发关闭请求只执行一次 beforeClose', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeClose = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    mountModal({ modelValue: true, beforeClose });
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    (document.querySelector('.ex-modal-mask') as HTMLElement).click();
    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper!.emitted('cancel')).toEqual([[]]);
    resolveGuard?.(false);
    await flushPromises();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('初始 beforeOpen 未通过前不渲染模态框', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeOpen = vi.fn(() => new Promise<boolean>(resolve => (resolveGuard = resolve)));
    mountModal({ modelValue: true, beforeOpen });
    await Promise.resolve();
    expect(document.querySelector('.ex-modal')).toBeNull();

    resolveGuard?.(true);
    await flushPromises();
    expect(document.querySelector('.ex-modal')).toBeTruthy();
    expect(wrapper!.emitted('open')).toEqual([[]]);
  });

  it('过期 beforeOpen 结果不会重新打开已由外部关闭的模态框', async () => {
    let resolveGuard: ((value: boolean) => void) | undefined;
    const beforeOpen = () => new Promise<boolean>(resolve => (resolveGuard = resolve));
    mountModal({ modelValue: false, beforeOpen });
    await wrapper!.setProps({ modelValue: true });
    await wrapper!.setProps({ modelValue: false });
    resolveGuard?.(true);
    await flushPromises();
    expect(document.querySelector('.ex-modal')).toBeNull();
  });

  it('守卫异常会阻止关闭并通过 guardError 暴露', async () => {
    const error = new Error('校验失败');
    mountModal({ modelValue: true, beforeClose: () => Promise.reject(error) });
    await flushPromises();
    (document.querySelector('.ex-modal-close') as HTMLButtonElement).click();
    await flushPromises();
    expect(wrapper!.emitted('guardError')).toEqual([[error, 'close']]);
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('打开守卫异常会保持关闭并回写受控状态', async () => {
    const error = new Error('加载失败');
    mountModal({ modelValue: true, beforeOpen: () => Promise.reject(error) });
    await flushPromises();
    expect(document.querySelector('.ex-modal')).toBeNull();
    expect(wrapper!.emitted('guardError')).toEqual([[error, 'open']]);
    expect(wrapper!.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('确认按钮发出 ok 并经守卫请求关闭', async () => {
    const beforeClose = vi.fn().mockReturnValue(true);
    mountModal({ modelValue: true, beforeClose });
    await flushPromises();
    const buttons = document.querySelectorAll<HTMLButtonElement>('.ex-modal-footer button');
    buttons[1]?.click();
    await flushPromises();
    expect(buttons[0]?.classList).toContain('ex-button--default');
    expect(wrapper!.emitted('ok')).toEqual([[]]);
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([false]);
  });

  it('确认加载期间禁用确认入口且不发出虚假 ok', async () => {
    mountModal({ modelValue: true, confirmLoading: true });
    await flushPromises();
    const buttons = document.querySelectorAll<HTMLButtonElement>('.ex-modal-footer button');

    expect(buttons[1]?.disabled).toBe(true);
    buttons[1]?.click();
    expect(wrapper!.emitted('ok')).toBeUndefined();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('destroyOnClose=false 时保留插槽组件实例', async () => {
    const mounted = vi.fn();
    const Child = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h('input', { class: 'modal-stateful-child' });
      },
    });
    mountModal({ modelValue: false, destroyOnClose: false }, { default: () => h(Child) });
    await wrapper!.setProps({ modelValue: true });
    await flushPromises();
    await wrapper!.setProps({ modelValue: false });
    await flushPromises();
    await wrapper!.setProps({ modelValue: true });
    await flushPromises();
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('destroyOnClose=true 时重新创建插槽组件', async () => {
    const mounted = vi.fn();
    const Child = defineComponent({
      setup() {
        onMounted(mounted);
        return () => h('div', { class: 'destroyed-child' });
      },
    });
    mountModal({ modelValue: true, destroyOnClose: true }, { default: () => h(Child) });
    await flushPromises();
    await wrapper!.setProps({ modelValue: false });
    await flushPromises();
    await wrapper!.setProps({ modelValue: true });
    await flushPromises();
    expect(mounted).toHaveBeenCalledTimes(2);
  });

  it('showFooter=false 不渲染默认底部，footer 插槽仍可显式渲染', async () => {
    mountModal({ modelValue: true, showFooter: false });
    await flushPromises();
    expect(document.querySelector('.ex-modal-footer')).toBeNull();
    wrapper!.unmount();

    mountModal(
      { modelValue: true, showFooter: false },
      { footer: () => h('div', { class: 'custom-modal-footer' }, '操作') }
    );
    await flushPromises();
    expect(document.querySelector('.custom-modal-footer')).toBeTruthy();
  });

  it.each(['small', 'medium', 'large'] as const)('应用 %s 预设尺寸', async size => {
    mountModal({ modelValue: true, size });
    await flushPromises();
    expect(document.querySelector('.ex-modal')?.classList).toContain(`ex-modal--${size}`);
  });

  it('通过注入配置控制传送后仍生效的霓虹与动画表现', async () => {
    wrapper = mount(ExConfigProvider, {
      props: { zIndex: 2400, neonEffect: false, animation: false },
      slots: { default: () => h(ExModal, { modelValue: true, title: '配置继承' }) },
      attachTo: document.body,
    });
    await flushPromises();

    expect(document.querySelector('.ex-modal')?.classList).not.toContain('ex-modal--neon');
    expect(document.querySelector('.ex-modal-root')?.classList).toContain(
      'ex-modal-root--no-motion'
    );
    expect((document.querySelector('.ex-modal-root') as HTMLElement).style.zIndex).toBe('2450');

    await wrapper.setProps({ neonEffect: true, animation: true });
    expect(document.querySelector('.ex-modal')?.classList).toContain('ex-modal--neon');
    expect(document.querySelector('.ex-modal-root')?.classList).not.toContain(
      'ex-modal-root--no-motion'
    );
  });

  it('运行时非法尺寸、类型与按钮类型安全回退', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountModal({
      modelValue: true,
      size: 'oversized',
      type: 'unknown',
      okType: 'invalid',
      width: {} as never,
    });
    await flushPromises();
    const modal = document.querySelector('.ex-modal')!;
    const okButton = document.querySelectorAll('.ex-modal-footer button')[1]!;

    expect(modal.classList).toContain('ex-modal--medium');
    expect(modal.classList).toContain('ex-modal--default');
    expect(modal.classList).not.toContain('ex-modal--oversized');
    expect(modal.classList).not.toContain('ex-modal--unknown');
    expect(okButton.classList).toContain('ex-button--primary');
    expect((modal as HTMLElement).style.width).toBe('');
    expect(warning.mock.calls.flat().join(' ')).toContain('width');
  });

  it.each([
    [680, '680px'],
    ['60%', '60%'],
  ])('将自定义宽度 %s 归一化为 %s', async (width, expected) => {
    mountModal({ modelValue: true, width });
    await flushPromises();
    expect((document.querySelector('.ex-modal') as HTMLElement).style.width).toBe(expected);
  });

  it('非有限或非正数宽度不覆盖预设尺寸', async () => {
    mountModal({ modelValue: true, width: Number.POSITIVE_INFINITY });
    await flushPromises();
    expect((document.querySelector('.ex-modal') as HTMLElement).style.width).toBe('');
    expect(document.querySelector('.ex-modal')?.classList).toContain('ex-modal--medium');
  });

  it('自定义包装类、正文样式与有效层级应用到正确元素', async () => {
    mountModal(
      {
        modelValue: true,
        wrapClassName: 'custom-wrap',
        bodyStyle: { maxHeight: '300px' },
        zIndex: 2100,
      },
      {}
    );
    await flushPromises();
    const root = document.querySelector<HTMLElement>('.ex-modal-root')!;
    expect(root.style.zIndex).toBe('2100');
    expect(document.querySelector('.ex-modal-wrap')?.classList).toContain('custom-wrap');
    expect((document.querySelector('.ex-modal-body') as HTMLElement).style.maxHeight).toBe('300px');
  });

  it('非法层级回退全局值，有限小数规范为非负整数', async () => {
    mountModal({ modelValue: true, zIndex: Number.NaN });
    await flushPromises();
    expect((document.querySelector('.ex-modal-root') as HTMLElement).style.zIndex).toBe('1050');

    await wrapper!.setProps({ zIndex: -10 });
    expect((document.querySelector('.ex-modal-root') as HTMLElement).style.zIndex).toBe('1050');

    await wrapper!.setProps({ zIndex: 2100.9 });
    expect((document.querySelector('.ex-modal-root') as HTMLElement).style.zIndex).toBe('2100');
  });

  it('appendToBody=false 时保留在组件挂载位置', async () => {
    mountModal({ modelValue: true, appendToBody: false });
    await flushPromises();
    expect(wrapper!.find('.ex-modal-root').exists()).toBe(true);
  });

  it('公开 open/close 保持幂等受控契约并返回面板元素', async () => {
    const beforeClose = vi.fn().mockResolvedValue(false);
    mountModal({ modelValue: true, beforeClose });
    await flushPromises();
    const exposed = wrapper!.vm as unknown as ExModalExposed;
    expect(exposed.getElement()).toBe(document.querySelector('.ex-modal'));
    await exposed.close();
    expect(beforeClose).toHaveBeenCalledTimes(1);
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();

    exposed.open();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();

    await wrapper!.setProps({ modelValue: false });
    exposed.open();
    expect(wrapper!.emitted('update:modelValue')?.at(-1)).toEqual([true]);
  });

  it('关闭状态调用 close 不执行守卫也不发出虚假更新', async () => {
    const beforeClose = vi.fn().mockReturnValue(true);
    mountModal({ modelValue: false, beforeClose });
    const exposed = wrapper!.vm as unknown as ExModalExposed;

    await expect(exposed.close()).resolves.toBe(false);
    expect(beforeClose).not.toHaveBeenCalled();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('外部关闭后发出 close 与 afterClose，保留受控单一事实来源', async () => {
    wrapper = mount(ExModal, {
      attachTo: document.body,
      props: { modelValue: true, destroyOnClose: true },
      global: { stubs: { transition: false } },
    });
    await flushPromises();
    await wrapper!.setProps({ modelValue: false });
    await new Promise(resolve => window.setTimeout(resolve, 350));
    expect(wrapper!.emitted('close')).toEqual([[]]);
    expect(wrapper!.emitted('afterClose')).toEqual([[]]);
  });
});
