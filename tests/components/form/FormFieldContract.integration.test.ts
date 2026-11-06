import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick, reactive, type Component } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';
import ExSwitch from '../../../src/components/switch/ExSwitch.vue';
import ExSlider from '../../../src/components/slider/ExSlider.vue';
import ExNumberInput from '../../../src/components/number-input/ExNumberInput.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import ExInput from '../../../src/components/input/ExInput.vue';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import ExRate from '../../../src/components/rate/ExRate.vue';

interface FieldCase {
  name: string;
  component: Component;
  selector: string;
  props?: Record<string, unknown>;
  sizeClass?: string;
}

const fields: FieldCase[] = [
  {
    name: 'TreeSelect',
    component: ExTreeSelect,
    selector: '[role="combobox"]',
    props: { data: [{ label: '部门', value: 'one' }] },
    sizeClass: 'ex-tree-select--large',
  },
  {
    name: 'TimePicker',
    component: ExTimePicker,
    selector: '[role="combobox"]',
    sizeClass: 'ex-time-picker--large',
  },
  {
    name: 'DateTimePicker',
    component: ExDateTimePicker,
    selector: 'input',
    sizeClass: 'ex-datetime-picker--large',
  },
  {
    name: 'ColorPicker',
    component: ExColorPicker,
    selector: '.ex-color-picker__trigger',
    sizeClass: 'ex-color-picker--large',
  },
  { name: 'Switch', component: ExSwitch, selector: 'input', sizeClass: 'ex-switch--large' },
  {
    name: 'Slider',
    component: ExSlider,
    selector: '[role="slider"]',
    sizeClass: 'ex-slider--large',
  },
  {
    name: 'NumberInput',
    component: ExNumberInput,
    selector: 'input',
    sizeClass: 'ex-number-input--large',
  },
  {
    name: 'Radio',
    component: ExRadio,
    selector: 'input',
    props: { value: 'one' },
    sizeClass: 'ex-radio--large',
  },
  { name: 'Input', component: ExInput, selector: 'input', sizeClass: 'ex-input--large' },
  { name: 'Checkbox', component: ExCheckbox, selector: 'input', sizeClass: 'ex-checkbox--large' },
  { name: 'Rate', component: ExRate, selector: '[role="slider"]', sizeClass: 'ex-rate--large' },
];

const wrappers: VueWrapper[] = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

function createField(field: FieldCase) {
  const state = reactive({ disabled: false, readonly: false });
  const wrapper = mount(
    {
      render: () =>
        h(
          ExForm,
          { ...state, size: 'large' },
          {
            default: () =>
              h(
                ExFormItem,
                { label: '业务字段', error: '字段错误' },
                {
                  default: () => h(field.component, { ...field.props, teleported: false }),
                }
              ),
          }
        ),
    },
    { attachTo: document.body }
  );
  wrappers.push(wrapper);
  return {
    wrapper,
    state,
    control: wrapper.get(field.selector),
    fieldWrapper: wrapper.findComponent(field.component),
  };
}

describe.each(fields)('$name 的真实 Form 字段契约', field => {
  it('继承字段标签、错误关联及 Form 尺寸', () => {
    const { wrapper, control } = createField(field);
    expect(control.attributes('aria-labelledby')).toBe(
      wrapper.get('.ex-form-item__label').attributes('id')
    );
    expect(control.attributes('aria-describedby')).toContain(
      wrapper.get('.ex-form-item__error').attributes('id')
    );
    expect(control.attributes('aria-invalid')).toBe('true');
    if (field.sizeClass) expect(wrapper.find(`.${field.sizeClass}`).exists()).toBe(true);
  });

  it.each(['disabled', 'readonly'] as const)('运行时继承 %s 后阻止键盘和点击修改', async mode => {
    const { wrapper, state, control, fieldWrapper } = createField(field);
    state[mode] = true;
    await nextTick();
    expect(control.attributes(`aria-${mode}`)).toBe('true');
    await control.trigger('keydown', { key: 'ArrowDown' });
    await control.trigger('keydown', { key: 'Enter' });
    await control.trigger('click');
    await control.trigger('change');
    expect(fieldWrapper.emitted('update:modelValue')).toBeUndefined();
    expect(control.attributes('aria-expanded')).not.toBe('true');
    expect(wrapper.find('.is-active').exists()).toBe(false);
  });

  it('显式尺寸覆盖 Form，同时显式 false 不能绕过 Form 禁用', async () => {
    const { wrapper, state, control } = createField({
      ...field,
      props: { ...field.props, size: 'small', disabled: false },
    });
    if (field.sizeClass) {
      expect(wrapper.find(`.${field.sizeClass.replace('large', 'small')}`).exists()).toBe(true);
    }
    state.disabled = true;
    await nextTick();
    expect(control.attributes('aria-disabled')).toBe('true');
  });
});

describe('字段的外部可访问性关联', () => {
  it('显式标签覆盖 Form 标签，并合并去重业务描述与字段错误', () => {
    const { wrapper, control } = createField({
      name: 'NumberInput',
      component: ExNumberInput,
      selector: 'input',
      props: { 'aria-labelledby': 'business-label', 'aria-describedby': 'help help hint' },
    });
    expect(control.attributes('aria-labelledby')).toBe('business-label');
    const errorId = wrapper.get('.ex-form-item__error').attributes('id');
    expect(control.attributes('aria-describedby')).toBe(`help hint ${errorId}`);
    expect(control.attributes('aria-errormessage')).toBe(errorId);
  });
});

describe('Picker 状态切换', () => {
  it.each(fields.slice(0, 4))('$name 打开后 Form 改为只读立即收起', async field => {
    const { state, control } = createField(field);
    await control.trigger('click');
    expect(control.attributes('aria-expanded')).toBe('true');
    state.readonly = true;
    await nextTick();
    expect(control.attributes('aria-expanded')).toBe('false');
  });
});

describe('只读开关的键盘导航', () => {
  it('阻止 Space 修改但保留 Tab 默认导航', async () => {
    const wrapper = mount(ExSwitch, { props: { readonly: true } });
    wrappers.push(wrapper);
    const input = wrapper.get('input').element;
    const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true });
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      cancelable: true,
      bubbles: true,
    });
    input.dispatchEvent(tab);
    input.dispatchEvent(space);
    expect(tab.defaultPrevented).toBe(false);
    expect(space.defaultPrevented).toBe(true);
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
