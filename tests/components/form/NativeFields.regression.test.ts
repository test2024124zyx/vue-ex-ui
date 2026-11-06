import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref, type Component } from 'vue';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import ExSwitch from '../../../src/components/switch/ExSwitch.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';
import ExRate from '../../../src/components/rate/ExRate.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('原生字段状态和可访问名称', () => {
  it.each([
    ['Checkbox', ExCheckbox],
    ['Switch', ExSwitch],
  ] as const)('%s 父组件拒绝更新时恢复 checked，接受更新时跟随模型', async (_name, component) => {
    const wrapper = mount(component as Component, {
      props: { modelValue: false },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    const input = wrapper.get<HTMLInputElement>('input');
    input.element.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true]);
    expect(input.element.checked).toBe(false);
    await wrapper.setProps({ modelValue: true });
    input.element.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    expect(input.element.checked).toBe(true);

    const value = ref(false);
    const accepted = mount(
      {
        render: () =>
          h(component as Component, {
            modelValue: value.value,
            'onUpdate:modelValue': (next: boolean) => (value.value = next),
          }),
      },
      { attachTo: document.body }
    );
    wrappers.push(accepted);
    accepted.get<HTMLInputElement>('input').element.click();
    await nextTick();
    expect(value.value).toBe(true);
    expect(accepted.get<HTMLInputElement>('input').element.checked).toBe(true);
  });

  it('Radio 外部名称落在真实输入上，动态名称同步更新', async () => {
    const label = ref('选项甲');
    const wrapper = mount({ render: () => h(ExRadio, { value: 'a', 'aria-label': label.value }) });
    wrappers.push(wrapper);
    expect(wrapper.get('input').attributes('aria-label')).toBe('选项甲');
    label.value = '更新后的名称';
    await nextTick();
    expect(wrapper.get('input').attributes('aria-label')).toBe('更新后的名称');
  });

  it('ColorPicker 显式名称覆盖通用按钮名称', () => {
    const wrapper = mount(ExColorPicker, { attrs: { 'aria-label': '图表前景颜色' } });
    wrappers.push(wrapper);
    expect(wrapper.get('button').attributes('aria-label')).toBe('图表前景颜色');
  });

  it.each(['readonly', 'disabled'] as const)('Rate 切换 %s 立即撤销悬停预览', async state => {
    const wrapper = mount(ExRate, { props: { modelValue: 1, showScore: true } });
    wrappers.push(wrapper);
    await wrapper.findAll('.ex-rate__star')[4]!.trigger('mouseenter');
    expect(wrapper.get('.ex-rate__text').text()).toBe('5');
    await wrapper.setProps({ [state]: true });
    expect(wrapper.get('.ex-rate__text').text()).toBe('1');
    await wrapper.trigger('mouseleave');
    expect(wrapper.get('.ex-rate__text').text()).toBe('1');
    expect(wrapper.attributes('aria-valuenow')).toBe('1');
  });

  it('Rate 无显式标签时有默认名称，仍允许业务覆盖', async () => {
    const wrapper = mount(ExRate);
    wrappers.push(wrapper);
    expect(wrapper.attributes('aria-label')).toBeTruthy();
    await wrapper.setProps({ ariaLabel: '服务评分' });
    expect(wrapper.attributes('aria-label')).toBe('服务评分');
  });
});
