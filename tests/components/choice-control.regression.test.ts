import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExCheckbox from '../../src/components/checkbox/ExCheckbox.vue';
import ExCheckboxGroup from '../../src/components/checkbox/ExCheckboxGroup.vue';
import ExRadio from '../../src/components/radio/ExRadio.vue';
import ExRadioGroup from '../../src/components/radio/ExRadioGroup.vue';
import ExSelect from '../../src/components/select/ExSelect.vue';
import ExSwitch from '../../src/components/switch/ExSwitch.vue';
import ExForm from '../../src/components/form/ExForm.vue';
import ExFormItem from '../../src/components/form/ExFormItem.vue';
import type { FormInstance } from '../../src/components/form/types';

enableAutoUnmount(afterEach);

describe('可选 modelValue 的控件状态', () => {
  it('表单重置为未定义时清除五个控件的本地状态', async () => {
    const model = reactive<{
      sw?: boolean;
      check?: boolean;
      group?: Array<string | number>;
      radio?: string;
      select?: string;
    }>({});
    const form = ref<FormInstance>();
    const options = [{ label: '已选项', value: 'a' }];
    const wrapper = mount(
      {
        render: () =>
          h(ExForm, { ref: form, model }, () => [
            h(ExFormItem, { prop: 'sw' }, () =>
              h(ExSwitch, {
                modelValue: model.sw,
                'onUpdate:modelValue': value => {
                  model.sw = value === true;
                },
              })
            ),
            h(ExFormItem, { prop: 'check' }, () =>
              h(ExCheckbox, {
                modelValue: model.check,
                'onUpdate:modelValue': value => {
                  model.check = value === true;
                },
              })
            ),
            h(ExFormItem, { prop: 'group' }, () =>
              h(ExCheckboxGroup, {
                options,
                modelValue: model.group,
                'onUpdate:modelValue': value => {
                  model.group = value;
                },
              })
            ),
            h(ExFormItem, { prop: 'radio' }, () =>
              h(
                ExRadioGroup,
                {
                  modelValue: model.radio,
                  'onUpdate:modelValue': value => {
                    model.radio = String(value);
                  },
                },
                () => h(ExRadio, { value: 'a' })
              )
            ),
            h(ExFormItem, { prop: 'select' }, () =>
              h(ExSelect, {
                options,
                modelValue: model.select,
                'onUpdate:modelValue': value => {
                  model.select = String(value);
                },
              })
            ),
          ]),
      },
      { attachTo: document.body }
    );

    const inputs = wrapper.findAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
    for (const input of inputs) await input.setValue(true);
    await wrapper.get('[role="combobox"]').trigger('click');
    document.body.querySelector<HTMLElement>('[role="option"]')!.click();
    await nextTick();
    expect([model.sw, model.check, model.group, model.radio, model.select]).toEqual([
      true,
      true,
      ['a'],
      'a',
      'a',
    ]);
    expect(inputs.every(input => input.element.checked)).toBe(true);
    expect(wrapper.getComponent(ExSelect).text()).toContain('已选项');

    form.value!.resetFields();
    await nextTick();
    expect(Object.values(model)).toEqual([undefined, undefined, undefined, undefined, undefined]);
    expect(inputs.map(input => input.element.checked)).toEqual([false, false, false, false]);
    expect(wrapper.getComponent(ExRadioGroup).vm.getValue()).toBe('');
    expect(wrapper.getComponent(ExSelect).text()).not.toContain('已选项');
  });
  it('Switch 未绑定时点击和公开方法都切换，解除控制后保留最后的确认值', async () => {
    const wrapper = mount(ExSwitch, { props: { activeValue: 'on', inactiveValue: 'off' } });
    const input = wrapper.get('input');
    expect(input.element.checked).toBe(false);
    wrapper.vm.toggle();
    await nextTick();
    expect(input.element.checked).toBe(true);
    await input.setValue(false);
    expect(input.element.checked).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toEqual([['on'], ['off']]);

    await wrapper.setProps({ modelValue: 'on' });
    await input.setValue(false);
    expect(input.element.checked).toBe(true);
    await wrapper.setProps({ modelValue: undefined });
    expect(input.element.checked).toBe(true);
    await input.setValue(false);
    expect(input.element.checked).toBe(false);
  });

  it('Switch 先通知按键，允许阻止切换，只读态也收到按键', async () => {
    const wrapper = mount(ExSwitch, {
      props: {
        onKeydown: event => {
          if (event.key === 'Enter') event.preventDefault();
        },
      },
    });
    const input = wrapper.get('input');
    await input.trigger('keydown', { key: 'ArrowRight' });
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await input.trigger('keydown', { key: ' ' });
    expect(Object.keys(wrapper.emitted()).slice(0, 3)).toEqual([
      'keydown',
      'update:modelValue',
      'change',
    ]);
    await wrapper.setProps({ readonly: true });
    await input.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('keydown')).toHaveLength(4);
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
  });

  it('独立 Checkbox 未绑定时保留自定义勾选值，空格操作继续从已选状态计算', async () => {
    const wrapper = mount(ExCheckbox, { props: { trueValue: 'yes', falseValue: 'no' } });
    const input = wrapper.get('input');
    await input.setValue(true);
    expect(input.element.checked).toBe(true);
    await input.trigger('keydown', { key: ' ' });
    expect(input.element.checked).toBe(false);
    expect(wrapper.emitted('update:modelValue')).toEqual([['yes'], ['no']]);
  });

  it('CheckboxGroup 的勾选、全选和反选在非受控时更新子控件', async () => {
    const options = [
      { label: '甲', value: 'a' },
      { label: '乙', value: 'b' },
    ];
    const wrapper = mount(ExCheckboxGroup, { props: { options } });
    const marked = () => wrapper.findAll('input').map(input => input.element.checked);
    await wrapper.get('input').setValue(true);
    expect(marked()).toEqual([true, false]);
    wrapper.vm.checkAll();
    await nextTick();
    expect(marked()).toEqual([true, true]);
    wrapper.vm.toggleAll();
    await nextTick();
    expect(marked()).toEqual([false, false]);
  });

  it('RadioGroup 未绑定时接收原生选择和公开 setValue', async () => {
    const wrapper = mount(ExRadioGroup, {
      slots: { default: () => [h(ExRadio, { value: 'a' }), h(ExRadio, { value: 'b' })] },
      attachTo: document.body,
    });
    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue(true);
    expect(wrapper.vm.getValue()).toBe('a');
    expect(inputs[0]!.element.checked).toBe(true);
    wrapper.vm.setValue('b');
    await nextTick();
    expect(inputs.map(input => input.element.checked)).toEqual([false, true]);
  });

  it.each([false, true])('Select 未绑定时保留选择，清除后回到空值，多选=%s', async multiple => {
    const wrapper = mount(ExSelect, {
      props: { multiple, clearable: true, options: [{ value: 'a', label: '甲选项' }] },
      attachTo: document.body,
    });
    await wrapper.get('[role="combobox"]').trigger('click');
    document.body.querySelector<HTMLElement>('[role="option"]')!.click();
    await nextTick();
    expect(wrapper.text()).toContain('甲选项');
    expect(wrapper.emitted('update:modelValue')).toEqual([[multiple ? ['a'] : 'a']]);
    await wrapper.get('.ex-select__clear').trigger('click');
    expect(wrapper.text()).not.toContain('甲选项');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([multiple ? [] : null]);
  });
});
