import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});
const createPicker = async (props = {}) => {
  const wrapper = mount(ExColorPicker, {
    props: { modelValue: '#808080', showAlpha: true, teleported: false, ...props },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  await wrapper.get('.ex-color-picker__trigger').trigger('keydown', { key: 'ArrowDown' });
  return wrapper;
};

describe('颜色选择的完整交互路径', () => {
  it('色板四向键和加速步长生成有效颜色，其他按键不修改值', async () => {
    const wrapper = await createPicker();
    const surface = wrapper.get('.ex-color-picker__sv');
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']) {
      await surface.trigger('keydown', { key, shiftKey: true });
    }
    expect(wrapper.emitted('change')).toHaveLength(4);
    expect(
      wrapper.emitted('change')!.every(([value]) => /^#[0-9a-f]{8}$/i.test(String(value)))
    ).toBe(true);
    await surface.trigger('keydown', { key: 'Tab' });
    expect(wrapper.emitted('change')).toHaveLength(4);
  });

  it.each(['hue', 'alpha'])('%s 滑块支持边界、翻页与方向操作且不越界', async part => {
    const wrapper = await createPicker();
    const slider = wrapper.get(`.ex-color-picker__${part}`);
    const maximum = part === 'hue' ? 360 : 100;
    await slider.trigger('keydown', { key: 'End' });
    expect(Number(slider.attributes('aria-valuenow'))).toBe(maximum);
    for (const key of ['ArrowLeft', 'ArrowDown', 'PageDown', 'PageUp', 'ArrowRight', 'ArrowUp']) {
      await slider.trigger('keydown', { key, shiftKey: true });
      expect(Number(slider.attributes('aria-valuenow'))).toBeGreaterThanOrEqual(0);
      expect(Number(slider.attributes('aria-valuenow'))).toBeLessThanOrEqual(maximum);
    }
    await slider.trigger('keydown', { key: 'Home' });
    expect(Number(slider.attributes('aria-valuenow'))).toBe(0);
    const count = wrapper.emitted('change')!.length;
    await slider.trigger('keydown', { key: 'Tab' });
    expect(wrapper.emitted('change')).toHaveLength(count);
  });

  it('有效输入支持确认、清空和重新选择，公开焦点方法保持可用', async () => {
    const wrapper = await createPicker({ modelValue: undefined });
    const input = wrapper.get<HTMLInputElement>('.ex-color-picker__input');
    await input.setValue('rgba(255, 0, 0, 0.5)');
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['#ff000080']);
    await wrapper.get('.ex-color-picker__btn--text').trigger('click');
    expect(wrapper.get('.ex-color-picker__trigger').classes()).toContain('is-empty');
    wrapper.vm.focus();
    expect(document.activeElement).toBe(wrapper.get('.ex-color-picker__trigger').element);
    wrapper.vm.blur();
    expect(wrapper.emitted('focus')).toBeTruthy();
    expect(wrapper.emitted('blur')).toBeTruthy();
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    await wrapper.get('.ex-color-picker__btn--primary').trigger('click');
    expect(wrapper.get('.ex-color-picker__trigger').classes()).not.toContain('is-empty');
  });

  it.each(['sv', 'alpha'])('%s 拖动处理越界坐标，失焦后停止后续移动', async part => {
    const wrapper = await createPicker();
    const slider = wrapper.get<HTMLElement>(`.ex-color-picker__${part}`);
    vi.spyOn(slider.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    slider.element.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: -20, clientY: 120, bubbles: true })
    );
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: -20 }));
    window.dispatchEvent(new Event('pointerup'));
    expect(wrapper.emitted('change')).toHaveLength(1);
    slider.element.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 50, clientY: 50, bubbles: true })
    );
    await nextTick();
    window.dispatchEvent(new Event('blur'));
    const count = wrapper.emitted('active-change')!.length;
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }));
    expect(wrapper.emitted('active-change')).toHaveLength(count);
    await wrapper.setProps({ readonly: true });
    expect(wrapper.find('.ex-color-picker__panel').exists()).toBe(false);
  });
});
