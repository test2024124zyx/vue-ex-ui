import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';
import {
  formatColor,
  hsvToRgb,
  parseColor,
  rgbToHsv,
} from '../../../src/components/color-picker/utils';

describe('颜色转换工具', () => {
  it('解析短十六进制、带透明度十六进制与 RGB 函数', () => {
    expect(parseColor('#29abe2')).toEqual({ r: 0x29, g: 0xab, b: 0xe2, a: 1 });
    expect(parseColor('#f008')).toEqual({ r: 255, g: 0, b: 0, a: 0x88 / 255 });
    expect(parseColor('rgb(255, 0, 128)')).toEqual({ r: 255, g: 0, b: 128, a: 1 });
    expect(parseColor('rgba(100%, 0%, 50%, 25%)')).toEqual({
      r: 255,
      g: 0,
      b: 128,
      a: 0.25,
    });
  });

  it('拒绝参数数量、数值范围或字符不合法的颜色', () => {
    expect(parseColor('not-a-color')).toBeNull();
    expect(parseColor('rgb(255, 0)')).toBeNull();
    expect(parseColor('rgb(255, 0, 0, 0.5)')).toBeNull();
    expect(parseColor('rgba(255, 0, 0)')).toBeNull();
    expect(parseColor('rgb(256, 0, 0)')).toBeNull();
    expect(parseColor('rgb(1px, 0, 0)')).toBeNull();
    expect(parseColor('#12345')).toBeNull();
  });

  it('启用透明度时输出格式始终包含 Alpha 通道', () => {
    const opaqueRed = { r: 255, g: 0, b: 0, a: 1 };
    expect(formatColor(opaqueRed, 'hex', true)).toBe('#ff0000ff');
    expect(formatColor(opaqueRed, 'rgb', true)).toBe('rgba(255, 0, 0, 1)');
    expect(formatColor({ ...opaqueRed, a: 0.5 }, 'hex', true)).toBe('#ff000080');
    expect(formatColor({ ...opaqueRed, a: 0.5 }, 'rgb', true)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('HSV 与 RGB 转换在有效范围内可逆', () => {
    const rgb = hsvToRgb(210, 0.75, 0.8);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    expect(hsv.h).toBeCloseTo(210, 0);
    expect(hsv.s).toBeCloseTo(0.75, 2);
    expect(hsv.v).toBeCloseTo(0.8, 2);
  });
});

describe('ExColorPicker', () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  const mountColorPicker = (props = {}, attrs = {}) => {
    wrapper = mount(ExColorPicker, { props, attrs, attachTo: document.body });
    return wrapper;
  };

  const openPanel = async () => {
    await wrapper!.find('.ex-color-picker__trigger').trigger('click');
    await nextTick();
    return document.querySelector<HTMLElement>('.ex-color-picker__panel')!;
  };

  it('使用原生按钮作为触发器并透传根元素属性', () => {
    mountColorPicker({ modelValue: '#29abe2' }, { 'data-testid': 'picker' });
    const trigger = wrapper!.find('.ex-color-picker__trigger');
    expect(trigger.element.tagName).toBe('BUTTON');
    expect(wrapper!.attributes('data-testid')).toBe('picker');
    expect(trigger.attributes('aria-haspopup')).toBe('dialog');
  });

  it('打开面板并同步可见状态事件', async () => {
    mountColorPicker();
    const panel = await openPanel();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(wrapper!.emitted('visible-change')).toEqual([[true]]);
    expect(wrapper!.find('.ex-color-picker__trigger').attributes('aria-expanded')).toBe('true');
  });

  it('初始禁用和运行时禁用都阻止交互', async () => {
    mountColorPicker({ disabled: true });
    const trigger = wrapper!.find<HTMLButtonElement>('.ex-color-picker__trigger');
    expect(trigger.attributes('disabled')).toBeDefined();
    expect(trigger.attributes('tabindex')).toBe('-1');
    await trigger.trigger('click');
    expect(document.querySelector('.ex-color-picker__panel')).toBeNull();

    await wrapper!.setProps({ disabled: false });
    await openPanel();
    await wrapper!.setProps({ disabled: true });
    expect(document.querySelector('.ex-color-picker__panel')).toBeNull();
    expect(wrapper!.find('.ex-color-picker__trigger').attributes('aria-expanded')).toBe('false');
  });

  it('面板打开后启用 Alpha 会恢复原始透明度', async () => {
    mountColorPicker({ modelValue: 'rgba(255, 0, 0, 0.5)', showAlpha: false });
    await openPanel();
    await wrapper!.setProps({ showAlpha: true });
    await nextTick();

    const alphaThumb = document.querySelector<HTMLElement>(
      '.ex-color-picker__alpha .ex-color-picker__slider-thumb'
    );
    expect(alphaThumb?.style.left).toBe('50%');
  });

  it('预设颜色使用按钮提交，非法预设值不会污染绑定值', async () => {
    mountColorPicker({ predefine: ['#ff0000', 'invalid'] });
    await openPanel();
    const items = document.querySelectorAll<HTMLButtonElement>('.ex-color-picker__predefine-item');
    expect(items[0]!.tagName).toBe('BUTTON');

    items[1]!.click();
    await nextTick();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();

    items[0]!.click();
    await nextTick();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('#ff0000');
    expect(wrapper!.emitted('change')!.at(-1)![0]).toBe('#ff0000');
  });

  it('清空颜色并通知表单消费者', async () => {
    mountColorPicker({ modelValue: '#29abe2', clearable: true });
    await openPanel();
    document.querySelector<HTMLButtonElement>('.ex-color-picker__btn--text')!.click();
    await nextTick();
    expect(wrapper!.emitted('clear')).toEqual([[]]);
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('');
    expect(document.querySelector('.ex-color-picker__panel')).toBeNull();
  });

  it('非法输入会恢复当前值且不会发出更新事件', async () => {
    mountColorPicker({ modelValue: '#29abe2' });
    await openPanel();
    const input = document.querySelector<HTMLInputElement>('.ex-color-picker__input')!;
    input.value = 'rgb(999, 0, 0)';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await nextTick();

    expect(input.value).toBe('#29abe2');
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('二维色板和滑块公开可访问语义', async () => {
    mountColorPicker({ modelValue: '#ff0000', showAlpha: true });
    await openPanel();
    const sv = document.querySelector<HTMLElement>('.ex-color-picker__sv')!;
    const hue = document.querySelector<HTMLElement>('.ex-color-picker__hue')!;
    const alpha = document.querySelector<HTMLElement>('.ex-color-picker__alpha')!;
    expect(sv.getAttribute('role')).toBe('application');
    expect(sv.getAttribute('tabindex')).toBe('0');
    expect(hue.getAttribute('role')).toBe('slider');
    expect(alpha.getAttribute('role')).toBe('slider');
    expect(hue.getAttribute('aria-valuemin')).toBe('0');
    expect(alpha.getAttribute('aria-valuemax')).toBe('100');
  });

  it('色相滑块支持方向键并提交变更', async () => {
    mountColorPicker({ modelValue: '#ff0000' });
    await openPanel();
    const hue = document.querySelector<HTMLElement>('.ex-color-picker__hue')!;
    hue.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await nextTick();

    expect(wrapper!.emitted('active-change')).toHaveLength(1);
    expect(wrapper!.emitted('change')).toHaveLength(1);
    expect(Number(hue.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  });

  it('透明度滑块支持 Home 键到达全透明边界', async () => {
    mountColorPicker({ modelValue: '#ff0000', showAlpha: true });
    await openPanel();
    const alpha = document.querySelector<HTMLElement>('.ex-color-picker__alpha')!;
    alpha.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await nextTick();

    expect(alpha.getAttribute('aria-valuenow')).toBe('0');
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('#ff000000');
  });

  it('指针正常释放时提交一次 change', async () => {
    mountColorPicker({ modelValue: '#ff0000' });
    await openPanel();
    const hue = document.querySelector<HTMLElement>('.ex-color-picker__hue')!;
    vi.spyOn(hue, 'getBoundingClientRect').mockReturnValue(createRect(100, 12));

    hue.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 20, bubbles: true, cancelable: true })
    );
    window.dispatchEvent(new Event('pointerup'));
    await nextTick();

    expect(wrapper!.emitted('active-change')).toHaveLength(1);
    expect(wrapper!.emitted('change')).toHaveLength(1);
  });

  it('pointercancel 清理拖拽监听且不提交 change', async () => {
    mountColorPicker({ modelValue: '#ff0000' });
    await openPanel();
    const hue = document.querySelector<HTMLElement>('.ex-color-picker__hue')!;
    vi.spyOn(hue, 'getBoundingClientRect').mockReturnValue(createRect(100, 12));

    hue.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 20, bubbles: true, cancelable: true })
    );
    window.dispatchEvent(new Event('pointercancel'));
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 80 }));
    window.dispatchEvent(new Event('pointerup'));
    await nextTick();

    expect(wrapper!.emitted('active-change')).toHaveLength(1);
    expect(wrapper!.emitted('change')).toBeUndefined();
  });

  it('零尺寸轨道不会产生无效颜色数值', async () => {
    mountColorPicker({ modelValue: '#ff0000' });
    await openPanel();
    const hue = document.querySelector<HTMLElement>('.ex-color-picker__hue')!;
    vi.spyOn(hue, 'getBoundingClientRect').mockReturnValue(createRect(0, 0));
    hue.dispatchEvent(
      new MouseEvent('pointerdown', { clientX: 20, bubbles: true, cancelable: true })
    );
    window.dispatchEvent(new Event('pointerup'));
    await nextTick();

    expect(wrapper!.emitted('active-change')).toBeUndefined();
    expect(wrapper!.emitted('change')).toBeUndefined();
  });

  it('点击组件外部关闭面板', async () => {
    mountColorPicker();
    await openPanel();
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(document.querySelector('.ex-color-picker__panel')).toBeNull();
    expect(wrapper!.emitted('visible-change')!.at(-1)).toEqual([false]);
  });

  it('关闭传送时将面板定位在组件内部', async () => {
    mountColorPicker({ teleported: false });
    await openPanel();
    const panel = wrapper!.find<HTMLElement>('.ex-color-picker__panel');
    expect(panel.exists()).toBe(true);
    expect(panel.element.style.position).toBe('absolute');
    expect(panel.element.style.top).toBe('calc(100% + 6px)');
  });

  it('面板内按 Escape 关闭并将焦点归还触发器', async () => {
    mountColorPicker();
    await openPanel();
    const hue = document.querySelector<HTMLElement>('.ex-color-picker__hue')!;
    hue.focus();
    hue.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();

    expect(document.querySelector('.ex-color-picker__panel')).toBeNull();
    expect(document.activeElement).toBe(wrapper!.find('.ex-color-picker__trigger').element);
  });
});

/** 构造稳定的轨道尺寸，避免测试依赖 JSDOM 的布局能力。 */
function createRect(width: number, height: number): DOMRect {
  return {
    left: 0,
    top: 0,
    width,
    height,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}
