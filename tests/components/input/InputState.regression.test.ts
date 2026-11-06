import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExInput from '../../../src/components/input/ExInput.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('输入法与动态交互状态回归', () => {
  it.each([{ isComposing: true }, { keyCode: 229 }])(
    '保留组合输入确认键，不触发业务 enter：%j',
    async composition => {
      const wrapper = mount(ExInput);
      wrappers.push(wrapper);
      await wrapper.get('input').trigger('keydown', { key: 'Enter', ...composition });
      expect(wrapper.emitted('enter')).toBeUndefined();
      expect(wrapper.emitted('keydown')).toHaveLength(1);
      await wrapper.get('input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('enter')).toHaveLength(1);
    }
  );

  it.each(['disabled', 'readonly'] as const)(
    '组合过程中切换 %s 后丢弃尾事件，恢复已提交值并允许重新编辑',
    async state => {
      const wrapper = mount(ExInput, { props: { modelValue: '原值' } });
      wrappers.push(wrapper);
      const input = wrapper.get('input');
      await input.trigger('compositionstart');
      input.element.value = '中文草稿';
      await input.trigger('input');
      await wrapper.setProps({ [state]: true });
      await input.trigger('compositionend');
      await input.trigger('input');
      await input.trigger('change');
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('change')).toBeUndefined();
      expect(input.element.value).toBe('原值');
      await wrapper.setProps({ [state]: false });
      await input.setValue('新值');
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['新值']);
    }
  );
});
