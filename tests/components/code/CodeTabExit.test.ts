import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h } from 'vue';
import ExCode from '../../../src/components/code/ExCode.vue';
import ExModal from '../../../src/components/modal/ExModal.vue';

describe('代码编辑区的键盘退出', () => {
  let wrapper: VueWrapper | undefined;
  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  const keydown = (element: HTMLElement, key: string, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    element.dispatchEvent(event);
    return event;
  };

  it.each([false, true])('Escape 后下一次 Tab 原生通过，反向为 %s', async shiftKey => {
    wrapper = mount(ExCode, {
      attachTo: document.body,
      props: { code: '  value', editable: true },
    });
    const editor = wrapper.get('textarea').element as HTMLTextAreaElement;
    editor.focus();
    expect(keydown(editor, 'Escape').defaultPrevented).toBe(true);
    expect(keydown(editor, 'Tab', { shiftKey }).defaultPrevented).toBe(false);
    expect(wrapper.emitted('update:code')).toBeUndefined();
    expect(keydown(editor, 'Tab').defaultPrevented).toBe(true);
    expect(wrapper.emitted('update:code')).toHaveLength(1);
  });

  it('退出后重入恢复缩进，切换只读或编辑状态不残留放行状态', async () => {
    wrapper = mount(ExCode, { attachTo: document.body, props: { code: 'x', editable: true } });
    let editor = wrapper.get('textarea').element as HTMLTextAreaElement;
    editor.focus();
    keydown(editor, 'Escape');
    editor.blur();
    editor.focus();
    expect(keydown(editor, 'Tab').defaultPrevented).toBe(true);
    keydown(editor, 'Escape');
    await wrapper.setProps({ readonly: true });
    expect(keydown(editor, 'Tab').defaultPrevented).toBe(false);
    await wrapper.setProps({ readonly: false });
    expect(keydown(editor, 'Tab').defaultPrevented).toBe(true);
    keydown(editor, 'Escape');
    await wrapper.setProps({ editable: false });
    await wrapper.setProps({ editable: true });
    editor = wrapper.get('textarea').element as HTMLTextAreaElement;
    expect(keydown(editor, 'Tab').defaultPrevented).toBe(true);
  });

  it('组合输入的 Escape 和 Tab 由输入法处理，真实 Escape 提供可访问退出提示', async () => {
    wrapper = mount(ExCode, { props: { code: 'x', editable: true } });
    const editor = wrapper.get('textarea').element as HTMLTextAreaElement;
    expect(keydown(editor, 'Escape', { isComposing: true }).defaultPrevented).toBe(false);
    expect(keydown(editor, 'Tab', { keyCode: 229 }).defaultPrevented).toBe(false);
    expect(keydown(editor, 'Tab').defaultPrevented).toBe(true);
    expect(editor.getAttribute('aria-describedby')).toBeTruthy();
    keydown(editor, 'Escape');
    await flushPromises();
    expect(wrapper.get('[role="status"]').text()).toMatch(/Tab/);
  });

  it('父 Modal 中第一次 Escape 留在编辑器，第二次才关闭父层', async () => {
    wrapper = mount(ExModal, {
      attachTo: document.body,
      props: { modelValue: true },
      slots: { default: () => h(ExCode, { code: 'x', editable: true }) },
    });
    await flushPromises();
    const editor = wrapper.findComponent(ExCode).get('textarea').element as HTMLTextAreaElement;
    editor.focus();
    keydown(editor, 'Tab');
    expect(document.activeElement).toBe(editor);
    const edits = wrapper.findComponent(ExCode).emitted('update:code')?.length;
    keydown(editor, 'Escape');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    keydown(editor, 'Tab', { shiftKey: true });
    expect(document.activeElement).not.toBe(editor);
    expect(wrapper.findComponent(ExCode).emitted('update:code')).toHaveLength(edits!);
    editor.focus();
    keydown(editor, 'Escape');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    keydown(editor, 'Escape');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('父 Modal 仅一个可聚焦元素时，圈闭在原处仍消耗一次 Tab 放行', async () => {
    wrapper = mount(ExModal, {
      attachTo: document.body,
      props: { modelValue: true, showClose: false, showFooter: false },
      slots: {
        default: () => h(ExCode, { code: 'x', editable: true, copyable: false, showLanguage: false }),
      },
    });
    await flushPromises();
    const code = wrapper.findComponent(ExCode);
    const editor = code.get('textarea').element as HTMLTextAreaElement;
    editor.focus();
    keydown(editor, 'Escape');
    keydown(editor, 'Tab');
    expect(document.activeElement).toBe(editor);
    expect(code.emitted('update:code')).toBeUndefined();
    keydown(editor, 'Tab');
    expect(code.emitted('update:code')).toEqual([['x  ']]);
  });
});
