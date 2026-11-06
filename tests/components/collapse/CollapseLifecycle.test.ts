import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExCollapse from '../../../src/components/collapse/ExCollapse.vue';
import ExCollapseItem from '../../../src/components/collapse/ExCollapseItem.vue';

afterEach(() => vi.useRealTimers());

describe('折叠面板生命周期', () => {
  it('真实过渡结束后清除临时高度，收起后恢复隐藏状态', async () => {
    vi.useFakeTimers();
    const name = ref('first');
    const wrapper = mount(ExCollapse, {
      props: { expandIconPosition: 'right', bordered: false, style: 'padding: 2px' },
      slots: {
        default: () =>
          h(
            ExCollapseItem,
            { name: name.value, title: '详情', style: { color: 'red' } },
            { title: () => '业务标题', default: () => h('input') }
          ),
      },
      global: { stubs: { transition: false } },
      attachTo: document.body,
    });
    const panel = wrapper.get<HTMLElement>('.ex-collapse-item__wrap');
    Object.defineProperty(panel.element, 'scrollHeight', { configurable: true, value: 120 });
    const child = wrapper.findComponent(ExCollapseItem);
    child.vm.toggle();
    await nextTick();
    await vi.runAllTimersAsync();
    expect(panel.element.style.height).toBe('');
    expect(panel.element.style.display).not.toBe('none');
    expect(wrapper.find('.ex-collapse-item__arrow--right').exists()).toBe(true);
    name.value = 'renamed';
    await nextTick();
    child.vm.toggle();
    await nextTick();
    await vi.runAllTimersAsync();
    child.vm.toggle();
    await nextTick();
    await vi.runAllTimersAsync();
    expect(panel.element.style.display).toBe('none');
    expect(panel.element.style.overflow).toBe('');
    expect(child.vm.getElement()).toBe(child.element);
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
    await wrapper.setProps({ disabled: true, style: { margin: '3px' } });
    child.vm.toggle();
    await nextTick();
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
    wrapper.unmount();
  });

  it('手风琴重复激活会收起，隐藏箭头与字符串样式不会丢失内容', async () => {
    const wrapper = mount(ExCollapse, {
      props: { accordion: true },
      slots: {
        default: () =>
          h(
            ExCollapseItem,
            { name: 'detail', showArrow: false, style: 'margin: 2px' },
            () => '详情'
          ),
      },
    });
    await wrapper.get('button').trigger('click');
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
    expect(wrapper.find('.ex-collapse-item__arrow').exists()).toBe(false);
    wrapper.unmount();
  });
});
