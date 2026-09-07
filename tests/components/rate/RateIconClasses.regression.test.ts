import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExRate from '../../../src/components/rate/ExRate.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('Rate 未选中图标类名契约', () => {
  it('自定义类名替换未选中图形，保留尺寸颜色，动态移除后恢复内置图标', async () => {
    const wrapper = mount(ExRate, {
      props: {
        modelValue: 1,
        voidIconClass: 'rating-font empty-star',
        size: 'large',
        voidColor: 'red',
      },
    });
    wrappers.push(wrapper);
    const voidIcon = wrapper.get('.ex-rate__icon--void');
    expect(voidIcon.get('i').classes()).toEqual(['rating-font', 'empty-star']);
    expect(voidIcon.find('svg').exists()).toBe(false);
    expect(voidIcon.get<HTMLElement>('.ex-icon').element.style.color).toBe('red');
    expect(
      voidIcon.get<HTMLElement>('.ex-icon').element.style.getPropertyValue('--ex-icon-size')
    ).toBe('24px');
    expect(wrapper.get('.ex-rate__icon--active').find('svg').exists()).toBe(true);

    await wrapper.setProps({ voidIconClass: 'new-empty-star' });
    expect(voidIcon.get('i').classes()).toEqual(['new-empty-star']);
    await wrapper.setProps({ voidIconClass: ' ' });
    expect(voidIcon.find('i').exists()).toBe(false);
    expect(voidIcon.find('svg').exists()).toBe(true);
  });

  it.each([false, true])('禁用状态切换选择对应图标类名，继承 Form：%s', async inherited => {
    const disabled = ref(true);
    const rateProps = {
      modelValue: 2,
      voidIconClass: 'empty-star',
      disabledVoidIconClass: 'disabled-star',
    };
    const wrapper = mount({
      render: () =>
        inherited
          ? h(
              ExForm,
              { model: {}, disabled: disabled.value },
              { default: () => h(ExFormItem, {}, { default: () => h(ExRate, rateProps) }) }
            )
          : h(ExRate, { ...rateProps, disabled: disabled.value }),
    });
    wrappers.push(wrapper);
    const rate = wrapper.get('.ex-rate');
    expect(rate.attributes('aria-disabled')).toBe('true');
    expect(rate.get('.ex-rate__icon--void i').classes()).toEqual(['disabled-star']);
    expect(rate.get('.ex-rate__icon--active').find('svg').exists()).toBe(true);
    disabled.value = false;
    await nextTick();
    expect(rate.get('.ex-rate__icon--void i').classes()).toEqual(['empty-star']);
    disabled.value = true;
    await nextTick();
    expect(rate.get('.ex-rate__icon--void i').classes()).toEqual(['disabled-star']);
  });

  it('当前状态未指定图标类名时保留内置图标', async () => {
    const wrapper = mount(ExRate, { props: { disabledVoidIconClass: 'disabled-star' } });
    wrappers.push(wrapper);
    const voidIcon = wrapper.get('.ex-rate__icon--void');
    expect(voidIcon.find('svg').exists()).toBe(true);
    await wrapper.setProps({ disabled: true });
    expect(voidIcon.get('i').classes()).toEqual(['disabled-star']);
    await wrapper.setProps({ disabledVoidIconClass: '', voidIconClass: 'empty-star' });
    expect(voidIcon.find('svg').exists()).toBe(true);
    expect(voidIcon.find('i').exists()).toBe(false);
  });

  it('有内容的插槽优先于类名，空插槽仍可使用类名回退', async () => {
    const showSlot = ref(true);
    const wrapper = mount(ExRate, {
      props: { voidIconClass: 'empty-star', disabledVoidIconClass: 'disabled-star' },
      slots: {
        'icon-void': ({ index }: { index: number }) =>
          showSlot.value ? h('span', { class: 'slot-star' }, String(index)) : null,
      },
    });
    wrappers.push(wrapper);
    const voidIcon = wrapper.get('.ex-rate__icon--void');
    expect(voidIcon.get('.slot-star').text()).toBe('1');
    expect(voidIcon.find('.ex-icon').exists()).toBe(false);
    await wrapper.setProps({ disabled: true });
    expect(voidIcon.get('.slot-star').text()).toBe('1');
    expect(voidIcon.find('.ex-icon').exists()).toBe(false);
    showSlot.value = false;
    await nextTick();
    expect(voidIcon.get('i').classes()).toEqual(['disabled-star']);
  });
});
