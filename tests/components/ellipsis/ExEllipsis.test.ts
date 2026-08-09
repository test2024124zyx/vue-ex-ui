import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExEllipsis from '../../../src/components/ellipsis/ExEllipsis.vue';
import type { ExEllipsisExposed } from '../../../src/components/ellipsis/types';

describe('ExEllipsis', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  const mountEllipsis = (props: Record<string, unknown> = {}, text = '完整文本') => {
    wrapper = mount(ExEllipsis, {
      props,
      slots: { default: text },
      attachTo: document.body,
    });
    return wrapper;
  };

  const exposed = () => wrapper!.vm as unknown as ExEllipsisExposed;
  const content = () => wrapper!.get<HTMLElement>('.ex-ellipsis__content');

  const setMetrics = ({
    scrollHeight = 20,
    clientHeight = 20,
    scrollWidth = 100,
    clientWidth = 100,
  } = {}) => {
    const element = content().element;
    Object.defineProperties(element, {
      scrollHeight: { configurable: true, value: scrollHeight },
      clientHeight: { configurable: true, value: clientHeight },
      scrollWidth: { configurable: true, value: scrollWidth },
      clientWidth: { configurable: true, value: clientWidth },
    });
  };

  it('默认只应用一行截断，不伪造溢出、名称或展开按钮', () => {
    mountEllipsis({ expandable: true });
    expect(content().attributes('style')).toContain('--ex-ellipsis-lines: 1');
    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(false);
    expect(content().attributes('title')).toBeUndefined();
    expect(wrapper!.attributes('role')).toBeUndefined();
    expect(wrapper!.attributes('aria-label')).toBeUndefined();
  });

  it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY])('非法行数 %s 回退到一行', lines => {
    mountEllipsis({ lines });
    expect(content().attributes('style')).toContain('--ex-ellipsis-lines: 1');
  });

  it('小数行数截断为正整数', () => {
    mountEllipsis({ lines: 2.9 });
    expect(content().attributes('style')).toContain('--ex-ellipsis-lines: 2');
  });

  it('不可展开内容溢出时才显示可聚焦 Tooltip', async () => {
    mountEllipsis({ tooltip: true }, '很长的完整文本');
    setMetrics({ scrollHeight: 80, clientHeight: 40 });
    exposed().checkOverflow();
    await nextTick();
    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(false);
    expect(content().attributes('title')).toBeUndefined();

    const tooltip = wrapper!.get('.ex-ellipsis__tooltip');
    expect(tooltip.attributes('tabindex')).toBe('0');
    await tooltip.trigger('focusin');
    await nextTick();
    expect(document.querySelector('.ex-tooltip__popper')?.textContent).toContain('很长的完整文本');
  });

  it('可展开内容使用原生按钮作为键盘入口，不增加重复 Tooltip 停止点', async () => {
    mountEllipsis({ expandable: true, tooltip: true }, '很长的完整文本');
    setMetrics({ scrollHeight: 80, clientHeight: 40 });
    exposed().checkOverflow();
    await nextTick();

    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(true);
    expect(wrapper!.get('.ex-ellipsis__tooltip').attributes('tabindex')).toBeUndefined();
  });

  it('inline 模式在最后一行预留区显示动态图标而不是底部按钮', async () => {
    mountEllipsis({ expandable: true, expandControl: 'inline', lines: 2 }, '很长的完整文本');
    setMetrics({ scrollHeight: 80, clientHeight: 40 });
    exposed().checkOverflow();
    await nextTick();

    const control = wrapper!.get<HTMLButtonElement>('.ex-ellipsis__inline-control');
    expect(wrapper!.classes()).toContain('ex-ellipsis--control-inline');
    expect(wrapper!.find('.ex-ellipsis__actions').exists()).toBe(false);
    expect(control.attributes('aria-controls')).toBe(content().element.id);
    expect(control.attributes('aria-expanded')).toBe('false');

    await control.trigger('click');
    expect(content().classes()).toContain('is-expanded');
    expect(control.attributes('aria-expanded')).toBe('true');
    expect(control.get('.ex-ellipsis__btn-icon').classes()).toContain('is-expanded');
  });

  it('button 是兼容默认模式，非法运行时值同样安全回退', async () => {
    mountEllipsis({ expandable: true, expandControl: 'unknown' });
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    exposed().checkOverflow();
    await nextTick();

    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(true);
    expect(wrapper!.find('.ex-ellipsis__inline-control').exists()).toBe(false);
    expect(wrapper!.classes()).toContain('ex-ellipsis--control-button');
  });

  it('单行水平溢出同样可被检测', async () => {
    mountEllipsis({ expandable: true });
    setMetrics({ scrollWidth: 180, clientWidth: 100 });
    exposed().checkOverflow();
    await nextTick();
    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(true);
  });

  it('可测量但未溢出时不显示操作与 tooltip', async () => {
    mountEllipsis({ expandable: true, tooltip: true });
    setMetrics();
    exposed().checkOverflow();
    await nextTick();
    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(false);
    expect(content().attributes('title')).toBeUndefined();
  });

  it('tooltip=false 即使溢出也不写 title', async () => {
    mountEllipsis({ tooltip: false, expandable: true });
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    exposed().checkOverflow();
    await nextTick();
    expect(content().attributes('title')).toBeUndefined();
    expect(wrapper!.get('.ex-ellipsis__tooltip').attributes('tabindex')).toBeUndefined();
  });

  it('ariaLabel 只命名分组，不会覆盖 Tooltip 的完整文本', async () => {
    mountEllipsis({ ariaLabel: '文章摘要', expandable: true }, '真实全文');
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    exposed().checkOverflow();
    await nextTick();
    expect(wrapper!.attributes('aria-label')).toBe('文章摘要');
    expect(wrapper!.attributes('role')).toBe('group');
    expect(content().attributes('title')).toBeUndefined();
    expect(wrapper!.get('.ex-ellipsis__tooltip').attributes('tabindex')).toBeUndefined();
  });

  it('普通不可展开内容且无显式名称时不添加冗余 group 角色', () => {
    mountEllipsis({ expandable: false });
    expect(wrapper!.attributes('role')).toBeUndefined();
  });

  it('非受控展开与收起发出状态和生命周期事件', async () => {
    mountEllipsis({ expandable: true });
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    exposed().checkOverflow();
    await nextTick();
    const button = wrapper!.get<HTMLButtonElement>('.ex-ellipsis__btn');
    const contentId = content().element.id;
    expect(button.attributes('aria-controls')).toBe(contentId);
    expect(button.attributes('aria-expanded')).toBe('false');

    await button.trigger('click');
    expect(content().classes()).toContain('is-expanded');
    expect(wrapper!.emitted('update:expanded')).toEqual([[true]]);
    expect(wrapper!.emitted('expand')).toEqual([[]]);

    await button.trigger('click');
    expect(content().classes()).toContain('is-ellipsis');
    expect(wrapper!.emitted('update:expanded')?.at(-1)).toEqual([false]);
    expect(wrapper!.emitted('collapse')).toEqual([[]]);
  });

  it('受控展开只请求更新，父级同步后才改变内容并发出 expand', async () => {
    mountEllipsis({ expandable: true, expanded: false });
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    exposed().checkOverflow();
    await nextTick();
    await wrapper!.get('.ex-ellipsis__btn').trigger('click');
    expect(wrapper!.emitted('update:expanded')).toEqual([[true]]);
    expect(wrapper!.emitted('expand')).toBeUndefined();
    expect(content().classes()).toContain('is-ellipsis');

    await wrapper!.setProps({ expanded: true });
    expect(content().classes()).toContain('is-expanded');
    expect(wrapper!.emitted('expand')).toEqual([[]]);
  });

  it('defaultExpanded 只初始化非受控状态', () => {
    mountEllipsis({ expandable: true, defaultExpanded: true });
    expect(content().classes()).toContain('is-expanded');
    expect(wrapper!.emitted('expand')).toBeUndefined();
  });

  it('expandable=false 时不宣称 expanded 生效', () => {
    mountEllipsis({ expandable: false, expanded: true });
    expect(content().classes()).toContain('is-ellipsis');
    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(false);
  });

  it('公开方法支持测量、展开、收起、切换和获取根元素', async () => {
    mountEllipsis({ expandable: true });
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    exposed().checkOverflow();
    expect(exposed().getElement()).toBe(wrapper!.element);

    exposed().expand();
    await nextTick();
    expect(exposed().isExpanded()).toBe(true);
    exposed().collapse();
    await nextTick();
    expect(exposed().isExpanded()).toBe(false);
    exposed().toggle();
    await nextTick();
    expect(exposed().isExpanded()).toBe(true);
  });

  it('插槽内容变更时通过 MutationObserver 重新测量溢出', async () => {
    let notifyMutation: (() => void) | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'MutationObserver',
      class {
        observe = observe;
        disconnect = disconnect;

        constructor(callback: () => void) {
          notifyMutation = callback;
        }
      }
    );
    vi.useFakeTimers();

    mountEllipsis({ expandable: true });
    setMetrics({ scrollHeight: 80, clientHeight: 20 });
    notifyMutation?.();
    vi.advanceTimersByTime(20);
    await nextTick();

    expect(observe).toHaveBeenCalledWith(
      content().element,
      expect.objectContaining({
        childList: true,
        characterData: true,
        attributes: true,
        subtree: true,
      })
    );
    expect(wrapper!.find('.ex-ellipsis__btn').exists()).toBe(true);
    wrapper!.unmount();
    wrapper = null;
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('卸载时释放 ResizeObserver、MutationObserver 与待执行测量', () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    const mutationDisconnect = vi.fn();
    const mutationObserve = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      }
    );
    vi.stubGlobal(
      'MutationObserver',
      class {
        observe = mutationObserve;
        disconnect = mutationDisconnect;
      }
    );
    mountEllipsis();
    expect(observe).toHaveBeenCalled();
    expect(mutationObserve).toHaveBeenCalled();
    wrapper!.unmount();
    wrapper = null;
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(mutationDisconnect).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('合并原生 class、style 与 data 属性', () => {
    wrapper = mount(ExEllipsis, {
      attrs: {
        class: 'custom-ellipsis',
        style: { maxWidth: '200px' },
        'data-testid': 'ellipsis',
      },
      slots: { default: '文本' },
    });
    expect(wrapper.classes()).toContain('custom-ellipsis');
    expect(wrapper.attributes('style')).toContain('max-width: 200px');
    expect(wrapper.attributes('data-testid')).toBe('ellipsis');
  });
});
