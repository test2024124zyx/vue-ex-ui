import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTagInput from '../../../src/components/tag/ExTagInput.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('标签编辑键盘和焦点回归', () => {
  it.each([{ isComposing: true }, { keyCode: 229 }])(
    '输入法确认和取消键不会提前结束编辑：%j',
    async composition => {
      const wrapper = mount(ExTagInput, { attachTo: document.body });
      wrappers.push(wrapper);
      await wrapper.get('button').trigger('click');
      await wrapper.get('input').setValue('中文标签');
      for (const key of ['Enter', 'Escape']) {
        await wrapper.get('input').trigger('keydown', { key, ...composition });
        expect(wrapper.find('input').exists()).toBe(true);
      }
      expect(wrapper.emitted('confirm')).toBeUndefined();
      expect(wrapper.emitted('cancel')).toBeUndefined();
    }
  );

  it.each(['Enter', 'Escape'])('%s 结束编辑后恢复添加按钮焦点', async key => {
    const wrapper = mount(ExTagInput, { attachTo: document.body });
    wrappers.push(wrapper);
    await wrapper.get('button').trigger('click');
    await wrapper.get('input').setValue('标签');
    await wrapper.get('input').trigger('keydown', { key });
    expect(wrapper.find('input').exists()).toBe(false);
    expect(document.activeElement).toBe(wrapper.get('button').element);
  });
});
