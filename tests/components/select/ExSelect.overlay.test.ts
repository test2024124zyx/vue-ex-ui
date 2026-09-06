import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import ExModal from '../../../src/components/modal/ExModal.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import ExPopover from '../../../src/components/popover/ExPopover.vue';
import ExTooltip from '../../../src/components/tooltip/ExTooltip.vue';

describe('选择浮层在业务弹窗中的组合交互', () => {
  let wrapper: ReturnType<typeof mount> | undefined;

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  it('子面板继承动态父层级，Escape 仅关闭子面板', async () => {
    const layer = ref(3000);
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            ExModal,
            { modelValue: true, zIndex: layer.value },
            {
              default: () => h(ExSelect, { options: [{ value: 'a', label: '甲' }] }),
            }
          ),
      }),
      { attachTo: document.body }
    );
    await flushPromises();
    const select = wrapper.findComponent(ExSelect);
    await select.find('.ex-select__trigger').trigger('click');
    const panel = document.querySelector<HTMLElement>('.ex-select__dropdown')!;
    expect(Number(panel.style.zIndex)).toBeGreaterThan(layer.value);
    layer.value = 6000;
    await flushPromises();
    expect(Number(panel.style.zIndex)).toBeGreaterThan(layer.value);
    await select.find('.ex-select__trigger').trigger('keydown', { key: 'Escape' });
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    expect(wrapper.findComponent(ExModal).emitted('cancel')).toBeUndefined();
  });

  it('Teleport Popover 的交互内容仍在父弹窗的 Tab 圈闭内', async () => {
    wrapper = mount(ExModal, {
      props: { modelValue: true, showClose: false, showFooter: false },
      slots: {
        default: () =>
          h(
            ExPopover,
            { modelValue: true },
            {
              default: () => h('button', { id: 'popup-trigger' }, '打开详情'),
              content: () => h('button', { id: 'option-action' }, '查看详情'),
            }
          ),
      },
      attachTo: document.body,
    });
    await flushPromises();
    const action = document.querySelector<HTMLButtonElement>('#option-action')!;
    expect(action).not.toBeNull();
    action.focus();
    action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement?.id).toBe('popup-trigger');
  });

  it('父弹窗隐藏后同步关闭保留实例的子面板', async () => {
    wrapper = mount(ExModal, {
      props: { modelValue: true, destroyOnClose: false },
      slots: { default: () => h(ExSelect, { options: [{ value: 'a', label: '甲' }] }) },
      attachTo: document.body,
    });
    await flushPromises();
    await wrapper.findComponent(ExSelect).find('.ex-select__trigger').trigger('click');
    expect(document.querySelector('.ex-select__dropdown')).not.toBeNull();
    await wrapper.setProps({ modelValue: false });
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
  });

  it('搜索输入内的 Tab 能到达下一个表单控件，关闭下拉不会抢回焦点', async () => {
    wrapper = mount(ExModal, {
      props: { modelValue: true, showClose: false, showFooter: false },
      slots: {
        default: () => [
          h(ExSelect, { searchable: true, options: [{ value: 'a', label: '甲' }] }),
          h('button', { id: 'next-field' }, '下一项'),
        ],
      },
      attachTo: document.body,
    });
    await flushPromises();
    const input = wrapper.findComponent(ExSelect).find('input');
    await input.trigger('click');
    (input.element as HTMLInputElement).focus();
    await input.trigger('keydown', { key: 'Tab' });
    await flushPromises();
    expect(document.activeElement?.id).toBe('next-field');
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
  });

  it.each(['popover', 'tooltip'])('父弹窗隐藏时受控 %s 不保留悬空面板', async kind => {
    wrapper = mount(ExModal, {
      props: { modelValue: true },
      slots: {
        default: () =>
          kind === 'popover'
            ? h(ExPopover, { modelValue: true, content: '受控面板' })
            : h(ExTooltip, { modelValue: true, content: '受控提示' }),
      },
      attachTo: document.body,
    });
    await flushPromises();
    expect(document.querySelector(`.ex-${kind}__popper`)).not.toBeNull();
    await wrapper.setProps({ modelValue: false });
    await flushPromises();
    expect(document.querySelector(`.ex-${kind}__popper`)).toBeNull();
  });

  it('点击 Popover 内 Select 的 Teleport 选项不会触发父面板的外部点击关闭', async () => {
    wrapper = mount(ExPopover, {
      props: { closeDelay: 0 },
      slots: {
        default: () => h('button', { id: 'open-popover' }, '编辑'),
        content: () => h(ExSelect, { options: [{ value: 'a', label: '甲' }] }),
      },
      attachTo: document.body,
    });
    await wrapper.find('#open-popover').trigger('click');
    await flushPromises();
    await wrapper.findComponent(ExSelect).find('.ex-select__trigger').trigger('click');
    document.querySelector<HTMLElement>('.ex-select__option')!.click();
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    expect(document.querySelector('.ex-popover__popper')).not.toBeNull();
    expect(wrapper.emitted('hide')).toBeUndefined();
  });

  it.each([
    { name: 'Select', isComposing: true, keyCode: 0 },
    { name: 'Cascader', isComposing: true, keyCode: 0 },
    { name: 'Select', isComposing: false, keyCode: 229 },
    { name: 'Cascader', isComposing: false, keyCode: 229 },
  ])(
    '$name 输入法确认候选不会提交选项（组合标记 $isComposing）',
    async ({ name, isComposing, keyCode }) => {
      const options = [{ value: 'a', label: '甲' }];
      wrapper =
        name === 'Select'
          ? mount(ExSelect, { props: { options, searchable: true }, attachTo: document.body })
          : mount(ExCascader, { props: { options, filterable: true }, attachTo: document.body });
      const input = wrapper.find('input');
      await input.trigger('keydown', { key: 'ArrowDown' });
      await input.trigger('keydown', { key: 'Enter', isComposing, keyCode });
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(input.attributes('aria-expanded')).toBe('true');
    }
  );
});
