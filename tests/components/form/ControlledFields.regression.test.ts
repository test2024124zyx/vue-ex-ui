import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExInput from '../../../src/components/input/ExInput.vue';
import ExNumberInput from '../../../src/components/number-input/ExNumberInput.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import ExRadioGroup from '../../../src/components/radio/ExRadioGroup.vue';
import ExSlider from '../../../src/components/slider/ExSlider.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('控件显示以父级确认值为准', () => {
  it.each(['text', 'textarea'] as const)('%s 在父级拒绝输入和清空时恢复确认值', async type => {
    const wrapper = mount(ExInput, { props: { type, modelValue: '确认值', clearable: true } });
    wrappers.push(wrapper);
    const input = wrapper.get<HTMLInputElement>('input, textarea');
    await input.setValue('拒绝值');
    await input.trigger('blur');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['拒绝值']);
    expect(input.element.value).toBe('确认值');
    await wrapper.get('.ex-input__action--clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['']);
    expect(input.element.value).toBe('确认值');
  });

  it.each([false, true])('输入转换与 lazy=%s 均保留父级确认结果', async lazy => {
    const value = ref('初始');
    const wrapper = mount({
      render: () =>
        h(ExInput, {
          modelValue: value.value,
          modelModifiers: { lazy },
          'onUpdate:modelValue': next => (value.value = String(next).toUpperCase()),
        }),
    });
    wrappers.push(wrapper);
    const input = wrapper.get<HTMLInputElement>('input');
    input.element.value = 'new';
    await input.trigger('input');
    if (lazy) {
      expect(input.element.value).toBe('new');
      expect(value.value).toBe('初始');
      await input.trigger('change');
    }
    expect(input.element.value).toBe('NEW');
    expect(value.value).toBe('NEW');
  });

  it('单选组拒绝更新时原生勾选与视觉样式一致', async () => {
    const wrapper = mount(ExRadioGroup, {
      props: { modelValue: 'a' },
      slots: { default: () => [h(ExRadio, { value: 'a' }), h(ExRadio, { value: 'b' })] },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    const inputs = wrapper.findAll<HTMLInputElement>('input');
    inputs[1]!.element.focus();
    await nextTick();
    inputs[1]!.element.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
    expect(inputs.map(input => input.element.checked)).toEqual([true, false]);
  });

  it.each([false, true])('滑块 range=%s 拒绝键盘请求后恢复滑块和附属输入', async range => {
    const wrapper = mount(ExSlider, {
      props: { modelValue: range ? [10, 30] : 10, range, showInput: true },
    });
    wrappers.push(wrapper);
    await wrapper.findAll('[role="slider"]')[0]!.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([range ? [11, 30] : 11]);
    expect(wrapper.findAll('[role="slider"]')[0]!.attributes('aria-valuenow')).toBe('10');
    expect(wrapper.findAll<HTMLInputElement>('input')[0]!.element.value).toBe('10');
  });

  it('数字溢出不得向模型提交非有限数值，失焦恢复原值', async () => {
    const wrapper = mount(ExNumberInput, { props: { modelValue: 7 } });
    wrappers.push(wrapper);
    const input = wrapper.get<HTMLInputElement>('input');
    await input.setValue('9'.repeat(309));
    await input.trigger('blur');
    expect(
      wrapper.emitted('update:modelValue')?.some(([value]) => !Number.isFinite(value)) ?? false
    ).toBe(false);
    expect(input.element.value).toBe('7');
  });
});
