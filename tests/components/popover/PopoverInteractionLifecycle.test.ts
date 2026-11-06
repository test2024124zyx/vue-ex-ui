import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExPopover from '../../../src/components/popover/ExPopover.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
});

describe('气泡浮层交互生命周期', () => {
  it('悬停跨入浮层会取消关闭，离开后按延迟关闭', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ExPopover, {
      props: {
        trigger: 'hover',
        openDelay: 20,
        closeDelay: 30,
        width: '20rem',
        customClass: 'business-popover',
        customStyle: 'color: red',
      },
      slots: {
        default: () => h('button', '查看'),
        title: () => '详情',
        content: () => h('button', '操作'),
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.trigger('mouseenter');
    await vi.advanceTimersByTimeAsync(20);
    const popup = document.querySelector<HTMLElement>('.ex-popover__popper')!;
    expect(popup.style.width).toBe('20rem');
    await wrapper.trigger('mouseleave');
    popup.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.advanceTimersByTimeAsync(40);
    expect(document.body.contains(popup)).toBe(true);
    popup.dispatchEvent(new MouseEvent('mouseleave'));
    await vi.advanceTimersByTimeAsync(30);
    expect(document.querySelector('.ex-popover__popper')).toBeNull();
  });

  it('焦点在触发器和内容之间移动时不关闭，离开二者后关闭', async () => {
    const wrapper = mount(ExPopover, {
      props: {
        trigger: 'focus',
        closeDelay: 0,
        openDelay: 0,
        width: 240,
        customStyle: { color: 'blue' },
      },
      slots: { default: () => h('button', '触发器'), content: () => h('button', '内容按钮') },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    const trigger = wrapper.get('button');
    await trigger.trigger('focusin');
    const popup = document.querySelector<HTMLElement>('.ex-popover__popper')!;
    const content = popup.querySelector('button')!;
    await trigger.trigger('focusout', { relatedTarget: content });
    content.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await nextTick();
    expect(document.body.contains(popup)).toBe(true);
    content.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: trigger.element })
    );
    await nextTick();
    expect(document.body.contains(popup)).toBe(true);
    await trigger.trigger('focusout', { relatedTarget: document.body });
    expect(document.querySelector('.ex-popover__popper')).toBeNull();
  });

  it('受控显示在禁用期间被抑制，恢复后尊重模型，并恢复触发器原有 ARIA', async () => {
    const wrapper = mount(ExPopover, {
      props: { modelValue: true, content: '提示', trigger: 'click' },
      slots: {
        default: () =>
          h(
            'button',
            { 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': 'original' },
            '菜单'
          ),
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await nextTick();
    await wrapper.setProps({ disabled: true });
    expect(document.querySelector('.ex-popover__popper')).toBeNull();
    await wrapper.setProps({ disabled: false });
    expect(document.querySelector('.ex-popover__popper')).not.toBeNull();
    const trigger = wrapper.get('button').element;
    wrapper.unmount();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-controls')).toBe('original');
    wrappers.pop();
  });
});
