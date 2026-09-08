import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';
import ExCode from '../../../src/components/code/ExCode.vue';
import type { ExCodeExposed } from '../../../src/components/code/types';

describe('Code 受控值', () => {
  let wrapper: VueWrapper | undefined;
  afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks(); });

  it('拒绝原生输入时回退 textarea，高亮、公开值和复制仍读取已确认内容', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    wrapper = mount(ExCode, { props: { code: 'confirmed', editable: true } });
    await wrapper.get('textarea').setValue('requested');
    expect(wrapper.emitted('update:code')).toEqual([['requested']]);
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('confirmed');
    expect(wrapper.get('.ex-code__line-content').text()).toBe('confirmed');
    const api = wrapper.vm as unknown as ExCodeExposed;
    expect(api.getCode()).toBe('confirmed');
    await api.copy();
    expect(writeText).toHaveBeenCalledWith('confirmed');
  });

  it('Tab 请求被拒绝时保留原选区，延迟确认后才提交内容与新选区', async () => {
    wrapper = mount(ExCode, { props: { code: 'abc', editable: true } });
    const editor = wrapper.get('textarea');
    const element = editor.element as HTMLTextAreaElement;
    element.setSelectionRange(1, 2);
    await editor.trigger('keydown', { key: 'Tab' });
    expect(wrapper.emitted('update:code')).toEqual([['a  c']]);
    expect(element.value).toBe('abc');
    expect([element.selectionStart, element.selectionEnd]).toEqual([1, 2]);
    await wrapper.setProps({ code: 'a  c' });
    expect(element.value).toBe('a  c');
    expect([element.selectionStart, element.selectionEnd]).toEqual([3, 3]);
  });

  it('显式空串保持受控，未传 code 可编辑，撤销控制保留最后确认值', async () => {
    wrapper = mount(ExCode, { props: { code: '', editable: true } });
    await wrapper.get('textarea').setValue('rejected');
    expect((wrapper.vm as unknown as ExCodeExposed).getCode()).toBe('');
    await wrapper.setProps({ code: 'server' });
    await wrapper.setProps({ code: undefined });
    expect((wrapper.vm as unknown as ExCodeExposed).getCode()).toBe('server');
    await wrapper.get('textarea').setValue('local');
    expect((wrapper.vm as unknown as ExCodeExposed).getCode()).toBe('local');
    wrapper.unmount();
    wrapper = mount(ExCode, { props: { editable: true } });
    await wrapper.get('textarea').setValue('new');
    expect((wrapper.vm as unknown as ExCodeExposed).getCode()).toBe('new');
  });

  it('真实 v-model 父级回写更新内容，外部替换不会采用旧请求的选区', async () => {
    const code = ref('before');
    wrapper = mount({ render: () => h(ExCode, { code: code.value, editable: true, 'onUpdate:code': (value: string) => { code.value = value; } }) });
    const child = wrapper.findComponent(ExCode);
    await child.get('textarea').setValue('accepted');
    expect((child.vm as unknown as ExCodeExposed).getCode()).toBe('accepted');
    code.value = 'outside';
    await nextTick();
    expect((child.get('textarea').element as HTMLTextAreaElement).value).toBe('outside');
    const editor = child.get('textarea');
    await editor.trigger('compositionstart');
    (editor.element as HTMLTextAreaElement).value = '中文';
    await editor.trigger('input', { isComposing: true });
    expect(code.value).toBe('outside');
    await editor.trigger('compositionend');
    await editor.trigger('input');
    expect(code.value).toBe('中文');
    expect(child.emitted('update:code')).toEqual([['accepted'], ['中文']]);
  });

  it('组合输入保留原生草稿，结束后只请求一次并按父级拒绝回退', async () => {
    wrapper = mount(ExCode, { props: { code: 'base', editable: true } });
    const editor = wrapper.get('textarea');
    const element = editor.element as HTMLTextAreaElement;
    element.setSelectionRange(1, 2);
    await editor.trigger('beforeinput');
    await editor.trigger('compositionstart');
    element.value = 'b中文se';
    await editor.trigger('input', { isComposing: true });
    expect(element.value).toBe('b中文se');
    expect(wrapper.emitted('update:code')).toBeUndefined();
    expect((wrapper.vm as unknown as ExCodeExposed).getCode()).toBe('base');
    await editor.trigger('compositionend');
    expect(wrapper.emitted('update:code')).toEqual([['b中文se']]);
    expect(element.value).toBe('base');
    expect([element.selectionStart, element.selectionEnd]).toEqual([1, 2]);
  });

  it('组合期间切换只读或替换编辑节点会丢弃旧草稿和迟到事件', async () => {
    wrapper = mount(ExCode, { props: { code: 'base', editable: true } });
    const editor = wrapper.get('textarea');
    const element = editor.element as HTMLTextAreaElement;
    await editor.trigger('compositionstart');
    element.value = 'draft';
    await editor.trigger('input', { isComposing: true });
    await wrapper.setProps({ readonly: true });
    await editor.trigger('compositionend');
    expect(element.value).toBe('base');
    expect(wrapper.emitted('update:code')).toBeUndefined();
    await wrapper.setProps({ readonly: false });
    await editor.trigger('compositionstart');
    await wrapper.setProps({ editable: false });
    await wrapper.setProps({ editable: true });
    element.value = 'late';
    await editor.trigger('compositionend');
    expect(wrapper.emitted('update:code')).toBeUndefined();
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('base');
  });

  it('同一节点解除只读后也忽略上一轮迟到的组合 input', async () => {
    wrapper = mount(ExCode, { props: { code: 'base', editable: true } });
    const editor = wrapper.get('textarea');
    const element = editor.element as HTMLTextAreaElement;
    await editor.trigger('compositionstart');
    await wrapper.setProps({ readonly: true });
    await wrapper.setProps({ readonly: false });
    element.value = 'late';
    await editor.trigger('input', { isComposing: true });
    await editor.trigger('compositionend');
    expect(element.value).toBe('base');
    expect(wrapper.emitted('update:code')).toBeUndefined();
  });
});
