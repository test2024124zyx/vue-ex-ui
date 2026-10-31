import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

const createPicker = (props = {}) => {
  const wrapper = mount(ExColorPicker, {
    props: { teleported: false, predefine: ['#0000ff'], ...props },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
};

describe('颜色选择的确认值与编辑草稿', () => {
  it.each([false, true])('接受回写=%s 时降至黑色再提高亮度保留原色相与饱和度', async controlled => {
    const value = ref<string | undefined>(controlled ? '#0000ff' : undefined);
    const host = mount({
      render: () =>
        h(ExColorPicker, {
          modelValue: value.value,
          teleported: false,
          predefine: ['#0000ff'],
          'onUpdate:modelValue': next => {
            if (controlled) value.value = next;
          },
        }),
    });
    wrappers.push(host);
    await host.get('.ex-color-picker__trigger').trigger('click');
    await host.get('.ex-color-picker__predefine-item').trigger('click');
    const surface = host.get('.ex-color-picker__sv');
    for (let index = 0; index < 11; index += 1) {
      await surface.trigger('keydown', { key: 'ArrowDown', shiftKey: true });
    }
    expect(host.get('.ex-color-picker__hue').attributes('aria-valuenow')).toBe('240');
    await surface.trigger('keydown', { key: 'ArrowUp', shiftKey: true });
    expect(host.get<HTMLInputElement>('.ex-color-picker__input').element.value).toBe('#00001a');
  });

  it('父级拒绝预设颜色与确认时，触发器始终显示原绑定值', async () => {
    const wrapper = createPicker({ modelValue: '#ff0000' });
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    await wrapper.get('.ex-color-picker__predefine-item').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['#0000ff']);
    expect(wrapper.get('.ex-color-picker__swatch-inner').attributes('style')).toContain(
      'rgb(255, 0, 0)'
    );
    await wrapper.get('.ex-color-picker__btn--primary').trigger('click');
    expect(wrapper.get('.ex-color-picker__swatch-inner').attributes('style')).toContain(
      'rgb(255, 0, 0)'
    );
  });

  it('受控空值拒绝选择后不伪造颜色，受控已有值拒绝清空后不丢失颜色', async () => {
    const wrapper = createPicker({ modelValue: '' });
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    await wrapper.get('.ex-color-picker__predefine-item').trigger('click');
    expect(wrapper.get('.ex-color-picker__trigger').classes()).toContain('is-empty');
    await wrapper.setProps({ modelValue: '#ff0000' });
    await wrapper.get('.ex-color-picker__btn--text').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['']);
    expect(wrapper.get('.ex-color-picker__trigger').classes()).not.toContain('is-empty');
    expect(wrapper.get('.ex-color-picker__swatch-inner').attributes('style')).toContain(
      'rgb(255, 0, 0)'
    );
  });

  it('未绑定模型时保存选择，重新打开不会退回初始空值', async () => {
    const wrapper = createPicker();
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    await wrapper.get('.ex-color-picker__predefine-item').trigger('click');
    await wrapper.get('.ex-color-picker__btn--primary').trigger('click');
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    expect(wrapper.get<HTMLInputElement>('.ex-color-picker__input').element.value).toBe('#0000ff');
  });

  it('父级转换回写后显示转换值，解除控制后继续从最后确认值编辑', async () => {
    const value = ref<string | undefined>('#ff0000');
    const host = mount({
      render: () =>
        h(ExColorPicker, {
          modelValue: value.value,
          teleported: false,
          predefine: ['#0000ff'],
          'onUpdate:modelValue': () => {
            if (value.value !== undefined) value.value = '#00ff00';
          },
        }),
    });
    wrappers.push(host);
    await host.get('.ex-color-picker__trigger').trigger('click');
    await host.get('.ex-color-picker__predefine-item').trigger('click');
    expect(host.get('.ex-color-picker__swatch-inner').attributes('style')).toContain(
      'rgb(0, 255, 0)'
    );
    value.value = undefined;
    await nextTick();
    expect(host.get<HTMLInputElement>('.ex-color-picker__input').element.value).toBe('#00ff00');
    await host.get('.ex-color-picker__predefine-item').trigger('click');
    expect(host.get('.ex-color-picker__swatch-inner').attributes('style')).toContain(
      'rgb(0, 0, 255)'
    );
  });
});
