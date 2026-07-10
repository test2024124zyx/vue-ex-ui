import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';

describe('ExTimePicker', () => {
  let wrapper: ReturnType<typeof mount> | null = null;
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
  });

  const mountTP = (props = {}) => {
    wrapper = mount(ExTimePicker, { props, attachTo: document.body });
    return wrapper;
  };

  it('显示绑定值', () => {
    mountTP({ modelValue: '09:30:00' });
    expect(wrapper!.find('.ex-time-picker__text').text()).toBe('09:30:00');
  });

  it('未选择时显示占位', () => {
    mountTP({ placeholder: '选择时间' });
    expect(wrapper!.find('.ex-time-picker__placeholder').text()).toBe('选择时间');
  });

  it('点击触发器打开面板', async () => {
    mountTP();
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-time-picker__panel')).toBeTruthy();
  });

  it('format 控制列数（HH:mm 只有两列）', async () => {
    mountTP({ format: 'HH:mm' });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    expect(document.querySelectorAll('.ex-time-picker__column').length).toBe(2);
  });

  it('点选单元格更新值', async () => {
    mountTP({ modelValue: '00:00:00' });
    await wrapper!.find('.ex-time-picker__trigger').trigger('click');
    await nextTick();
    const firstHourCell = document
      .querySelectorAll<HTMLElement>('.ex-time-picker__column')[0]!
      .querySelectorAll<HTMLElement>('.ex-time-picker__cell')[5]!;
    firstHourCell.click();
    await nextTick();
    const emitted = wrapper!.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect((emitted!.at(-1)![0] as string).startsWith('05:')).toBe(true);
  });

  it('清空触发 clear', async () => {
    mountTP({ modelValue: '09:30:00', clearable: true });
    await wrapper!.find('.ex-time-picker__clear').trigger('click');
    expect(wrapper!.emitted('clear')).toBeTruthy();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('');
  });
});
