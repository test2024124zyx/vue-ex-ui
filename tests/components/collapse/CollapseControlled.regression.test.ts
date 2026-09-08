import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExCollapse from '../../../src/components/collapse/ExCollapse.vue';
import ExCollapseItem from '../../../src/components/collapse/ExCollapseItem.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));
const slots = {
  default: () => ['a', 'b'].map(name => h(ExCollapseItem, { name, title: name }, () => name)),
};

describe('Collapse 严格受控', () => {
  it('空数组也保持受控，点击和公开方法不提前展开', async () => {
    const wrapper = mount(ExCollapse, { props: { modelValue: [] }, slots });
    wrappers.push(wrapper);
    const headers = wrapper.findAll('[aria-expanded]');
    await headers[0].trigger('click');
    expect(headers[0].attributes('aria-expanded')).toBe('false');
    wrapper.vm.setActiveNames(['b']);
    await nextTick();
    expect(headers[1].attributes('aria-expanded')).toBe('false');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']], [['b']]]);
    await wrapper.setProps({ modelValue: ['a'] });
    expect(headers[0].attributes('aria-expanded')).toBe('true');
    await headers[1].trigger('click');
    await wrapper.setProps({ modelValue: undefined });
    expect(headers[1].attributes('aria-expanded')).toBe('false');
    await headers[1].trigger('click');
    expect(headers[1].attributes('aria-expanded')).toBe('true');
  });

  it('手风琴 null 是受控空态，更新载荷不会污染外部数组', async () => {
    const wrapper = mount(ExCollapse, { props: { modelValue: null, accordion: true }, slots });
    wrappers.push(wrapper);
    await wrapper.findAll('[aria-expanded]')[0].trigger('click');
    expect(wrapper.find('[aria-expanded="true"]').exists()).toBe(false);
    await wrapper.setProps({ modelValue: 'a' });
    await wrapper.findAll('[aria-expanded]')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
    expect(wrapper.find('[aria-expanded="true"]').exists()).toBe(true);
    const names = ['a'];
    await wrapper.setProps({ modelValue: names, accordion: false });
    await wrapper.findAll('[aria-expanded]')[1].trigger('click');
    const requested = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as string[];
    requested.push('external-mutation');
    expect(names).toEqual(['a']);
    expect(wrapper.findAll('[aria-expanded="true"]')).toHaveLength(1);
  });
});
