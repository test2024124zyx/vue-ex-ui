import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';
import { parseColor } from '../../../src/components/color-picker/utils';

describe('color utils', () => {
  it('解析 hex / rgb / rgba', () => {
    expect(parseColor('#29abe2')).toMatchObject({ r: 0x29, g: 0xab, b: 0xe2, a: 1 });
    expect(parseColor('rgb(255, 0, 0)')).toMatchObject({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toMatchObject({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(parseColor('not-a-color')).toBeNull();
  });
});

describe('ExColorPicker', () => {
  let wrapper: ReturnType<typeof mount> | null = null;
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
  });

  const mountCP = (props = {}) => {
    wrapper = mount(ExColorPicker, { props, attachTo: document.body });
    return wrapper;
  };

  it('渲染触发器', () => {
    mountCP({ modelValue: '#29abe2' });
    expect(wrapper!.find('.ex-color-picker__swatch-inner').exists()).toBe(true);
  });

  it('点击触发器打开面板', async () => {
    mountCP();
    await wrapper!.find('.ex-color-picker__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-color-picker__panel')).toBeTruthy();
  });

  it('显示透明度滑块', async () => {
    mountCP({ showAlpha: true });
    await wrapper!.find('.ex-color-picker__trigger').trigger('click');
    await nextTick();
    expect(document.querySelector('.ex-color-picker__alpha')).toBeTruthy();
  });

  it('点击预定义颜色提交值', async () => {
    mountCP({ predefine: ['#ff0000', '#00ff00'] });
    await wrapper!.find('.ex-color-picker__trigger').trigger('click');
    await nextTick();
    const items = document.querySelectorAll<HTMLElement>('.ex-color-picker__predefine-item');
    items[0]!.click();
    await nextTick();
    expect(wrapper!.emitted('update:modelValue')).toBeTruthy();
    expect((wrapper!.emitted('change')!.at(-1)![0] as string).toLowerCase()).toBe('#ff0000');
  });

  it('清空按钮触发 clear', async () => {
    mountCP({ modelValue: '#29abe2', clearable: true });
    await wrapper!.find('.ex-color-picker__trigger').trigger('click');
    await nextTick();
    const clearBtn = document.querySelector<HTMLElement>('.ex-color-picker__btn--text');
    clearBtn!.click();
    expect(wrapper!.emitted('clear')).toBeTruthy();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('');
  });
});
