import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExTabs from '../../../src/components/tabs/ExTabs.vue';
import ExTabPane from '../../../src/components/tabs/ExTabPane.vue';

describe('纵向页签键盘交互', () => {
  it('上下方向、首尾、空格与输入法遵守活动页签和禁用项约束', async () => {
    const wrapper = mount(ExTabs, {
      props: { position: 'left', style: 'margin: 2px' },
      slots: {
        default: () => [
          h(ExTabPane, { name: 'a', label: '甲', style: 'padding: 2px' }, () => '甲内容'),
          h(ExTabPane, { name: 'disabled', label: '不可选', disabled: true }),
          h(ExTabPane, { name: 'b', label: '乙', style: { padding: '4px' } }, () => '乙内容'),
        ],
      },
      attachTo: document.body,
    });
    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[0]!.trigger('keydown', { key: 'ArrowDown' });
    expect(tabs[2]!.attributes('aria-selected')).toBe('true');
    await tabs[2]!.trigger('keydown', { key: 'ArrowUp' });
    expect(tabs[0]!.attributes('aria-selected')).toBe('true');
    await tabs[0]!.trigger('keydown', { key: 'End' });
    await tabs[2]!.trigger('keydown', { key: 'Home' });
    await tabs[0]!.trigger('keydown', { key: ' ' });
    const events = wrapper.emitted('change')!.length;
    await tabs[0]!.trigger('keydown', { key: 'Escape' });
    await tabs[0]!.trigger('keydown', { key: 'Enter', isComposing: true });
    expect(wrapper.emitted('change')).toHaveLength(events);
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
    const pane = wrapper.findAllComponents(ExTabPane)[0]!;
    expect(pane.vm.getElement()).toBe(pane.element);
    wrapper.unmount();
  });
});
