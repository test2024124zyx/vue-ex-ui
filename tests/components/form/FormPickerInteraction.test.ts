import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick, reactive, type Component } from 'vue';
import ExModal from '../../../src/components/modal/ExModal.vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExRadioGroup from '../../../src/components/radio/ExRadioGroup.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';

const wrappers: VueWrapper[] = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

const pickers: Array<{ name: string; component: Component; selector: string }> = [
  { name: 'TreeSelect', component: ExTreeSelect, selector: '[role="combobox"]' },
  { name: 'TimePicker', component: ExTimePicker, selector: '[role="combobox"]' },
  { name: 'DateTimePicker', component: ExDateTimePicker, selector: 'input' },
  { name: 'ColorPicker', component: ExColorPicker, selector: 'button' },
];

describe('业务弹窗内的 Picker 交互', () => {
  it.each(pickers)('$name 浮层高于父弹窗，Escape 仅关闭当前面板', async field => {
    const wrapper = mount(ExModal, {
      props: { modelValue: true, title: '编辑记录' },
      slots: { default: () => h(field.component) },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await flushPromises();
    const control = wrapper.findComponent(field.component).get(field.selector);
    await control.trigger('click');
    await flushPromises();
    const panelId = control.attributes('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    const modal = document.querySelector<HTMLElement>('.ex-modal-root');
    // TreeSelect 的 aria-controls 关联树语义节点，样式承载在它的父面板。
    const stylePanel = panel?.closest<HTMLElement>('[style*="z-index"]');
    expect(stylePanel).not.toBeNull();
    expect(modal).not.toBeNull();
    expect(Number(stylePanel!.style.zIndex)).toBeGreaterThan(Number(modal!.style.zIndex));
    await control.trigger('keydown', { key: 'Escape' });
    await flushPromises();
    expect(control.attributes('aria-expanded')).toBe('false');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('搜索树的中文候选确认不会选中或退出，Escape 从搜索框关闭面板', async () => {
    const wrapper = mount(ExTreeSelect, {
      props: { filterable: true, teleported: false, data: [{ label: '部门', value: 'one' }] },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    const trigger = wrapper.get('[role="combobox"]');
    await trigger.trigger('click');
    const search = wrapper.get('input');
    await search.trigger('keydown', { key: 'Enter', isComposing: true });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(trigger.attributes('aria-expanded')).toBe('true');
    await search.trigger('keydown', { key: 'ArrowDown', isComposing: true });
    expect(document.activeElement).toBe(search.element);
    await search.trigger('keydown', { key: 'Escape' });
    await nextTick();
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger.element);
  });
});

describe('单选组字段契约', () => {
  it('继承 Form 状态并保持子选项原有名称，解除只读后可以正常选择', async () => {
    const state = reactive({ readonly: true, value: 'a' });
    const wrapper = mount(
      {
        render: () =>
          h(
            ExForm,
            { readonly: state.readonly, size: 'large' },
            {
              default: () =>
                h(
                  ExFormItem,
                  { label: '审批结果', error: '需要选择' },
                  {
                    default: () =>
                      h(
                        ExRadioGroup,
                        {
                          modelValue: state.value,
                          'onUpdate:modelValue': value => {
                            state.value = String(value);
                          },
                        },
                        {
                          default: () => [
                            h(ExRadio, { label: '通过', value: 'a' }),
                            h(ExRadio, { label: '拒绝', value: 'b' }),
                          ],
                        }
                      ),
                  }
                ),
            }
          ),
      },
      { attachTo: document.body }
    );
    wrappers.push(wrapper);
    const group = wrapper.get('[role="radiogroup"]');
    const inputs = wrapper.findAll('input');
    expect(group.attributes('aria-labelledby')).toBe(
      wrapper.get('.ex-form-item__label').attributes('id')
    );
    expect(group.attributes('aria-describedby')).toContain(
      wrapper.get('.ex-form-item__error').attributes('id')
    );
    expect(inputs[1]!.attributes('aria-labelledby')).toBeUndefined();
    expect(inputs[1]!.attributes('aria-readonly')).toBe('true');
    await inputs[1]!.trigger('click');
    expect(state.value).toBe('a');
    state.readonly = false;
    await nextTick();
    await inputs[1]!.setValue(true);
    expect(state.value).toBe('b');
  });
});
