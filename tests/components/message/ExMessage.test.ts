import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExMessage from '../../../src/components/message/ExMessage.vue';
import type { ExMessageExposed, ExMessageProps } from '../../../src/components/message/types';

let wrapper: VueWrapper | null = null;

const mountMessage = (
  props: Partial<ExMessageProps> = {},
  slots: Record<string, string> = {},
  attrs: Record<string, unknown> = {}
): VueWrapper => {
  wrapper = mount(ExMessage, {
    props: { content: '操作完成', duration: 0, ...props },
    slots,
    attrs,
  });
  return wrapper;
};

const exposed = (): ExMessageExposed => wrapper!.vm as unknown as ExMessageExposed;

describe('ExMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('普通消息使用非打断式状态语义，错误消息使用警报语义', async () => {
    mountMessage();
    const root = wrapper!.get('.ex-message');
    expect(root.attributes('role')).toBe('status');
    expect(root.attributes('aria-live')).toBe('polite');
    expect(root.attributes('aria-atomic')).toBe('true');
    expect(root.classes()).toContain('ex-message--info');

    await wrapper!.setProps({ type: 'error' });
    expect(root.attributes('role')).toBe('alert');
    expect(root.attributes('aria-live')).toBe('assertive');
    expect(root.classes()).toContain('ex-message--error');
  });

  it('五种状态使用稳定样式与装饰性图标，loading 图标才旋转', async () => {
    mountMessage({ type: 'info' });
    for (const type of ['info', 'success', 'warning', 'error', 'loading'] as const) {
      await wrapper!.setProps({ type });
      expect(wrapper!.get('.ex-message').classes()).toContain(`ex-message--${type}`);
      const icon = wrapper!.get('.ex-message__icon');
      expect(icon.attributes('aria-hidden')).toBe('true');
      expect(icon.classes().includes('ex-message__icon-loading')).toBe(type === 'loading');
    }

    await wrapper!.setProps({ showIcon: false });
    expect(wrapper!.find('.ex-message__icon').exists()).toBe(false);
  });

  it('关闭控件使用原生按钮并保证关闭事件幂等', async () => {
    mountMessage({ closable: true });
    const button = wrapper!.get<HTMLButtonElement>('.ex-message__close');
    expect(button.element.tagName).toBe('BUTTON');
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toBeTruthy();

    await button.trigger('click');
    await button.trigger('click');
    expect(wrapper!.emitted('close')).toEqual([[]]);
    expect(exposed().isVisible()).toBe(false);
  });

  it('自动关闭可在悬停时暂停，并按精确剩余时长恢复', async () => {
    mountMessage({ duration: 1000 });
    vi.advanceTimersByTime(400);
    await wrapper!.get('.ex-message').trigger('mouseenter');
    vi.advanceTimersByTime(2000);
    expect(wrapper!.emitted('close')).toBeUndefined();

    await wrapper!.get('.ex-message').trigger('mouseleave');
    vi.advanceTimersByTime(599);
    expect(wrapper!.emitted('close')).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(wrapper!.emitted('close')).toEqual([[]]);
  });

  it('运行期间修改 duration 会从新时长重新计时', async () => {
    mountMessage({ duration: 1000 });
    vi.advanceTimersByTime(500);
    await wrapper!.setProps({ duration: 2000 });

    vi.advanceTimersByTime(1999);
    expect(wrapper!.emitted('close')).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(wrapper!.emitted('close')).toEqual([[]]);
  });

  it('HTML 内容经过消毒且纯文本模式不会解释标签', async () => {
    mountMessage({
      content:
        '<strong onclick="alert(1)">完成</strong><script>bad()</script><a href="javascript:bad()">链接</a>',
      dangerouslyUseHTMLString: true,
    });
    const content = wrapper!.get('.ex-message__content');
    expect(content.find('strong').exists()).toBe(true);
    expect(content.html()).not.toContain('onclick');
    expect(content.html()).not.toContain('<script');
    expect(content.html()).not.toContain('javascript:');

    await wrapper!.setProps({ content: '<strong>文本</strong>', dangerouslyUseHTMLString: false });
    expect(content.find('strong').exists()).toBe(false);
    expect(content.text()).toBe('<strong>文本</strong>');
  });

  it('内容、图标与关闭插槽真实覆盖默认渲染', () => {
    mountMessage(
      { closable: true },
      {
        default: '<span class="custom-content">插槽内容</span>',
        icon: '<span class="custom-icon">I</span>',
        close: '<span class="custom-close">X</span>',
      }
    );
    expect(wrapper!.get('.custom-content').text()).toBe('插槽内容');
    expect(wrapper!.get('.custom-icon').text()).toBe('I');
    expect(wrapper!.get('.custom-close').text()).toBe('X');
  });

  it('原生 class、style 与 data 属性落到根元素，旧伪属性不会泄漏', () => {
    mountMessage(
      {},
      {},
      {
        class: 'custom-message',
        style: { opacity: '0.9' },
        'data-testid': 'message',
        customClass: 'legacy-class',
        customStyle: 'color:red',
        offset: 40,
        zIndex: 9999,
        closeOnRouteChange: true,
      }
    );
    const root = wrapper!.get('.ex-message');
    expect(root.classes()).toContain('custom-message');
    expect(root.attributes('style')).toContain('opacity: 0.9');
    expect(root.attributes('data-testid')).toBe('message');
    expect(root.attributes('customclass')).toBeUndefined();
    expect(root.attributes('customstyle')).toBeUndefined();
    expect(root.attributes('offset')).toBeUndefined();
    expect(root.attributes('zindex')).toBeUndefined();
    expect(root.attributes('closeonroutechange')).toBeUndefined();
  });

  it('暴露方法返回真实状态与根元素，卸载会清理计时器', async () => {
    mountMessage({ duration: 1000 });
    expect(exposed().getElement()).toBe(wrapper!.get('.ex-message').element);
    expect(exposed().isVisible()).toBe(true);
    expect(vi.getTimerCount()).toBe(1);

    exposed().close();
    await flushPromises();
    expect(exposed().isVisible()).toBe(false);
    wrapper!.unmount();
    wrapper = null;
    expect(vi.getTimerCount()).toBe(0);
  });
});
