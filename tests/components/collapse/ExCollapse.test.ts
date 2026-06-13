import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExCollapse from '../../../src/components/collapse/ExCollapse.vue';
import ExCollapseItem from '../../../src/components/collapse/ExCollapseItem.vue';

const items = () => [
  h(ExCollapseItem, { name: 'a', title: 'Title A' }, () => 'Content A'),
  h(ExCollapseItem, { name: 'b', title: 'Title B' }, () => 'Content B'),
];

const toArray = (v: unknown) => (Array.isArray(v) ? v : [v]);

describe('ExCollapse', () => {
  it('renders item headers', () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: [] },
      slots: { default: items },
    });
    const headers = wrapper.findAll('.ex-collapse-item__header');
    expect(headers.length).toBe(2);
    expect(wrapper.text()).toContain('Title A');
    expect(wrapper.text()).toContain('Title B');
  });

  it('emits update:modelValue and change when a header is clicked', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: [] },
      slots: { default: items },
    });
    await wrapper.findAll('.ex-collapse-item__header')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(toArray(wrapper.emitted('update:modelValue')!.at(-1)![0])).toContain('a');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('allows multiple panels open by default', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: ['a'] },
      slots: { default: items },
    });
    await wrapper.findAll('.ex-collapse-item__header')[1].trigger('click');
    const val = toArray(wrapper.emitted('update:modelValue')!.at(-1)![0]);
    expect(val).toContain('a');
    expect(val).toContain('b');
  });

  it('accordion mode keeps only one panel open', async () => {
    const wrapper = mount(ExCollapse, {
      props: { modelValue: ['a'], accordion: true },
      slots: { default: items },
    });
    await wrapper.findAll('.ex-collapse-item__header')[1].trigger('click');
    const val = toArray(wrapper.emitted('update:modelValue')!.at(-1)![0]).filter(Boolean);
    expect(val).toContain('b');
    expect(val).not.toContain('a');
  });
});
