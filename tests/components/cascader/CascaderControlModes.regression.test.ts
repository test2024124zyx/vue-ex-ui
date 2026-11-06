import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';

enableAutoUnmount(afterEach);

const options = [
  { value: 'first', label: '甲组' },
  { value: 'second', label: '乙组' },
];

describe('Cascader 受控模式切换', () => {
  it('未提供 modelValue 时本地确认选择和清空，同时正常发出事件', async () => {
    const wrapper = mount(ExCascader, { props: { options, teleported: false } });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.get('.ex-cascader__option').trigger('click');
    expect(wrapper.get('input').element.value).toBe('甲组');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['first']]);
    await wrapper.get('.ex-cascader__clear').trigger('click');
    expect(wrapper.get('input').element.value).toBe('');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]]);
  });

  it('显式 null 是受控空值，拒绝回写后仍为空且无清空入口', async () => {
    const wrapper = mount(ExCascader, {
      props: { options, modelValue: null, teleported: false },
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.get('.ex-cascader__option').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['first']]);
    expect(wrapper.get('input').element.value).toBe('');
    expect(wrapper.find('.ex-cascader__clear').exists()).toBe(false);
  });

  it('解除受控保留最后确认值，再接入受控不会采用被拒绝的本地请求', async () => {
    const wrapper = mount(ExCascader, {
      props: { options, modelValue: ['first'], teleported: false },
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.findAll('.ex-cascader__option')[1]!.trigger('click');
    expect(wrapper.get('input').element.value).toBe('甲组');
    await wrapper.setProps({ modelValue: undefined });
    expect(wrapper.get('input').element.value).toBe('甲组');
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.findAll('.ex-cascader__option')[1]!.trigger('click');
    expect(wrapper.get('input').element.value).toBe('乙组');
    await wrapper.setProps({ modelValue: ['first'] });
    expect(wrapper.get('input').element.value).toBe('甲组');
    await wrapper.setProps({ modelValue: null });
    expect(wrapper.get('input').element.value).toBe('');
    await wrapper.setProps({ modelValue: undefined });
    expect(wrapper.get('input').element.value).toBe('');
  });

  it('真实父组件接入和移除 modelValue 属性后沿已确认路径继续', async () => {
    const controlled = ref(false);
    const value = ref(['second']);
    const wrapper = mount({
      render: () =>
        h(ExCascader, {
          options,
          teleported: false,
          ...(controlled.value ? { modelValue: value.value } : {}),
        }),
    });
    await wrapper.get('.ex-cascader__input-wrapper').trigger('click');
    await wrapper.get('.ex-cascader__option').trigger('click');
    expect(wrapper.get('input').element.value).toBe('甲组');
    controlled.value = true;
    await nextTick();
    expect(wrapper.get('input').element.value).toBe('乙组');
    controlled.value = false;
    await nextTick();
    expect(wrapper.get('input').element.value).toBe('乙组');
    await wrapper.get('.ex-cascader__clear').trigger('click');
    expect(wrapper.get('input').element.value).toBe('');
    expect(value.value).toEqual(['second']);
  });
});
