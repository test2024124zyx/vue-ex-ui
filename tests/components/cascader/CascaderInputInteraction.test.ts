import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';

enableAutoUnmount(afterEach);

const options = [
  { value: 'east', label: '杭州东' },
  { value: 'west', label: '杭州西' },
];

describe('Cascader 的输入交互', () => {
  it('单选已有值时从空文本开始搜索，取消后恢复所选路径', async () => {
    const wrapper = mount(ExCascader, {
      props: { options, filterable: true, modelValue: ['east'], teleported: false },
      attrs: { required: true },
      attachTo: document.body,
    });
    const input = wrapper.get('input');
    expect(input.element.value).toBe('杭州东');
    input.element.focus();
    expect(input.element.selectionStart).toBe(0);
    expect(input.element.selectionEnd).toBe(input.element.value.length);
    await input.trigger('click');
    expect(input.element.value).toBe('');
    expect(input.element.checkValidity()).toBe(true);
    input.element.value += '杭州';
    await input.trigger('input');
    expect(wrapper.findAll('.ex-cascader__search-results [role="option"]')).toHaveLength(2);
    expect(input.element.value).toBe('杭州');
    await input.trigger('keydown', { key: 'Escape' });
    expect(input.element.value).toBe('杭州东');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
  it('冒泡的原生事件只调用外部监听器一次', async () => {
    const onClick = vi.fn();
    const onInput = vi.fn();
    const onKeydown = vi.fn();
    const wrapper = mount(ExCascader, {
      props: { options, filterable: true },
      attrs: { onClick, onInput, onKeydown },
      attachTo: document.body,
    });
    const input = wrapper.get('input');

    await input.trigger('click');
    await input.setValue('杭州');
    await input.trigger('keydown', { key: 'ArrowDown' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onKeydown).toHaveBeenCalledTimes(1);
  });

  it('原生约束校验将非冒泡的 invalid 事件交给输入框监听器', () => {
    const onInvalid = vi.fn((event: Event) => event.preventDefault());
    const onInvalidOnce = vi.fn();
    const wrapper = mount(ExCascader, {
      props: { options, filterable: true },
      attrs: { required: true, onInvalid, onInvalidOnce },
      attachTo: document.body,
    });
    const input = wrapper.get('input').element;

    expect(input.checkValidity()).toBe(false);
    expect(input.checkValidity()).toBe(false);
    expect(onInvalid).toHaveBeenCalledTimes(2);
    expect(onInvalidOnce).toHaveBeenCalledTimes(1);
    expect(onInvalid.mock.calls[0]?.[0].target).toBe(input);
    expect(onInvalid.mock.calls[0]?.[0].defaultPrevented).toBe(true);
  });

  it.each([false, true])('鼠标选择后键盘仍可导航，搜索模式=%s', async filterable => {
    const wrapper = mount(ExCascader, {
      props: { options, filterable, multiple: true },
      attachTo: document.body,
    });
    const input = wrapper.get('input');
    input.element.focus();
    await input.trigger('click');
    if (filterable) await input.setValue('杭州');
    const option = document.querySelector<HTMLButtonElement>('button[role="option"]')!;
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    option.dispatchEvent(event);
    // jsdom 不执行鼠标按下的默认聚焦动作，这里补上一致的浏览器行为。
    if (!event.defaultPrevented) option.focus();
    option.click();
    await nextTick();

    expect(document.activeElement).toBe(input.element);
    await input.trigger('keydown', { key: 'End' });
    const activeId = input.attributes('aria-activedescendant');
    expect(document.getElementById(activeId!)?.textContent).toContain('杭州西');
  });

  it('输入法组合期间不筛选，确认文字后更新结果', async () => {
    const wrapper = mount(ExCascader, {
      props: { options, filterable: true },
      attachTo: document.body,
    });
    const input = wrapper.get('input');
    await input.trigger('click');
    input.element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    input.element.value = 'hangzhou';
    input.element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    await nextTick();
    expect(document.querySelector('.ex-cascader__empty')).toBeNull();
    expect(input.element.value).toBe('hangzhou');

    input.element.value = '杭州';
    input.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await nextTick();
    expect(document.querySelectorAll('.ex-cascader__search-result-content')).toHaveLength(2);
  });

  it.each([false, true])('单选提交结束旧组合输入，来自搜索结果：%s', async searched => {
    const wrapper = mount(ExCascader, {
      props: { options, filterable: true },
      attachTo: document.body,
    });
    const input = wrapper.get('input');
    input.element.focus();
    await input.trigger('click');
    if (searched) await input.setValue('杭州');
    await input.trigger('compositionstart');
    input.element.value = 'hangzhou';
    input.element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    await nextTick();

    const buttons = document.querySelectorAll<HTMLButtonElement>('button[role="option"]');
    buttons[1]!.dispatchEvent(new MouseEvent('mousedown', { cancelable: true }));
    buttons[1]!.click();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['west']]);
    await wrapper.setProps({ modelValue: ['west'] });
    expect(input.element.value).toBe('杭州西');

    input.element.value = '杭州';
    await input.trigger('compositionend');
    expect(input.element.value).toBe('杭州西');
    await Promise.resolve();
    await input.trigger('input');
    expect(input.attributes('aria-expanded')).toBe('false');
    await input.setValue('杭州东');
    expect(input.attributes('aria-expanded')).toBe('true');
  });

  it.each(['paste', 'beforeinput'] as const)(
    '没有尾随事件时，%s 可开始与旧组合内容相同的新输入',
    async startEvent => {
      const wrapper = mount(ExCascader, {
        props: { modelValue: ['east'], options, filterable: true, clearable: true },
        attachTo: document.body,
      });
      const input = wrapper.get('input');
      await input.trigger('click');
      await input.trigger('compositionstart');
      input.element.value = 'hangzhou';
      input.element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
      await input.trigger('click');
      input.element.value = '杭州东';
      await input.trigger('compositionend');
      await wrapper.get('.ex-cascader__clear').trigger('click');
      await wrapper.setProps({ modelValue: [] });

      const inputType = startEvent === 'paste' ? 'insertFromPaste' : 'insertText';
      if (startEvent === 'paste') await input.trigger('paste');
      else input.element.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType }));
      input.element.value = '杭州东';
      input.element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
      await nextTick();
      expect(input.attributes('aria-expanded')).toBe('true');
      expect(input.element.value).toBe('杭州东');
    }
  );

  it('表单重置清除正在组合的草稿，迟到的输入法事件不会重新打开搜索', async () => {
    const model = reactive({ station: ['east'] });
    const wrapper = mount(ExForm, {
      props: { model },
      slots: {
        default: () =>
          h(ExFormItem, { prop: 'station' }, () =>
            h(ExCascader, { modelValue: model.station, options, filterable: true })
          ),
      },
      attachTo: document.body,
    });
    const input = wrapper.get('input');
    input.element.focus();
    await input.trigger('click');
    await input.trigger('compositionstart');
    input.element.value = 'hangzhou';
    input.element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    await nextTick();
    expect(input.element.value).toBe('hangzhou');

    wrapper.vm.resetFields();
    await nextTick();
    expect(input.element.value).toBe('杭州东');

    input.element.value = 'hangzhou';
    input.element.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    expect(input.element.value).toBe('杭州东');
    input.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await Promise.resolve();
    input.element.value = '杭州';
    input.element.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText' })
    );
    await nextTick();
    expect(input.element.value).toBe('杭州东');
    expect(input.attributes('aria-expanded')).toBe('false');

    await input.setValue('杭州西');
    expect(input.attributes('aria-expanded')).toBe('true');
    expect(document.querySelectorAll('.ex-cascader__search-result-content')).toHaveLength(1);
  });
});
