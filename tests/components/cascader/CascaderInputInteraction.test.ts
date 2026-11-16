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
