import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExTabs from '../../../src/components/tabs/ExTabs.vue';
import ExTabPane from '../../../src/components/tabs/ExTabPane.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));
const slots = {
  default: () => ['a', 'b', 'c'].map(name => h(ExTabPane, { name, label: name }, () => name)),
};

describe('Tabs 严格受控', () => {
  it('父级实际删除标签但拒绝替代值时，同一次关闭只发一次更新请求', async () => {
    const names = ref(['a', 'b', 'c']);
    const wrapper = mount({
      render: () =>
        h(
          ExTabs,
          {
            modelValue: 'a',
            closable: true,
            onTabRemove: (name: string | number) => {
              names.value = names.value.filter(value => value !== name);
            },
          },
          () => names.value.map(name => h(ExTabPane, { name, key: name, label: name }, () => name))
        ),
    });
    wrappers.push(wrapper);
    await wrapper.findAll('.ex-tabs__tab-close')[0].trigger('click');
    await nextTick();
    expect(wrapper.getComponent(ExTabs).emitted('update:modelValue')).toEqual([['b']]);
    expect(wrapper.getComponent(ExTabs).emitted('change')).toEqual([['b']]);
    expect(wrapper.find('[aria-selected="true"]').exists()).toBe(false);
  });

  it('点击、键盘和关闭均只请求切换，父级回写才更新选中项', async () => {
    const wrapper = mount(ExTabs, { props: { modelValue: 'a', closable: true }, slots });
    wrappers.push(wrapper);
    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1].trigger('click');
    expect(tabs[0].attributes('aria-selected')).toBe('true');
    await tabs[0].trigger('keydown', { key: 'End' });
    expect(tabs[2].attributes('aria-selected')).toBe('false');
    await wrapper.findAll('.ex-tabs__tab-close')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([['b'], ['c'], ['b']]);
    expect(tabs[0].attributes('aria-selected')).toBe('true');
    await wrapper.setProps({ modelValue: 'b' });
    expect(tabs[1].attributes('aria-selected')).toBe('true');
    await tabs[2].trigger('click');
    await wrapper.setProps({ modelValue: undefined });
    expect(tabs[1].attributes('aria-selected')).toBe('true');
    await tabs[2].trigger('click');
    expect(tabs[2].attributes('aria-selected')).toBe('true');
  });

  it('受控标签被移除时请求替代项但不自选；未受控标签正常切换', async () => {
    const names = ref(['a', 'b', 'c']);
    const value = ref<string | undefined>('b');
    const wrapper = mount({
      render: () =>
        h(ExTabs, { modelValue: value.value }, () =>
          names.value.map(name => h(ExTabPane, { name, key: name, label: name }, () => name))
        ),
    });
    wrappers.push(wrapper);
    names.value = ['a', 'c'];
    await nextTick();
    await nextTick();
    expect(wrapper.find('[aria-selected="true"]').exists()).toBe(false);
    expect(wrapper.getComponent(ExTabs).emitted('update:modelValue')?.at(-1)).toEqual(['c']);
    value.value = 'c';
    await nextTick();
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('c');
    value.value = undefined;
    await nextTick();
    await wrapper.findAll('[role="tab"]')[0].trigger('click');
    expect(wrapper.get('[aria-selected="true"]').text()).toBe('a');
  });
});
