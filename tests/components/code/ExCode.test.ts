import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ExCode from '../../../src/components/code/ExCode.vue';
import type { ExCodeExposed } from '../../../src/components/code/types';

describe('ExCode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('卸载后复制完成不再发出事件或安排提示计时器', async () => {
    vi.useFakeTimers();
    let finish!: () => void;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(
          () =>
            new Promise<void>(resolve => {
              finish = resolve;
            })
        ),
      },
    });
    const wrapper = mount(ExCode, { props: { code: 'a' } });
    const pending = (wrapper.vm as unknown as ExCodeExposed).copy();
    wrapper.unmount();
    const count = vi.getTimerCount();
    finish();
    try {
      expect(await pending).toBe(false);
      expect(vi.getTimerCount()).toBe(count);
      expect(wrapper.emitted('copy')).toBeUndefined();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('较早的复制完成不覆盖较新复制失败的结果', async () => {
    let finish!: () => void;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi
          .fn()
          .mockImplementationOnce(
            () =>
              new Promise<void>(resolve => {
                finish = resolve;
              })
          )
          .mockRejectedValueOnce(new Error('denied')),
      },
    });
    const wrapper = mount(ExCode, { props: { code: 'a' } });
    const api = wrapper.vm as unknown as ExCodeExposed;
    const first = api.copy();
    expect(await api.copy()).toBe(false);
    finish();
    expect(await first).toBe(false);
    expect(wrapper.emitted('copy')).toBeUndefined();
    expect(wrapper.emitted('copy-error')).toHaveLength(1);
    wrapper.unmount();
  });

  it('默认 plaintext 应按纯文本渲染，不生成高亮 token', () => {
    const code = '<span class="danger" onclick="alert(1)">文本</span>';
    const wrapper = mount(ExCode, {
      props: { code, copyable: false, showLanguage: false },
    });

    const content = wrapper.find('.ex-code__line-content');
    expect(content.text()).toBe(code);
    // 纯文本下不应出现任何 token span（即无注入风险）。
    expect(wrapper.find('[class^="ex-token-"]').exists()).toBe(false);
  });

  it('指定 javascript 时应同步渲染语法高亮 token', () => {
    const wrapper = mount(ExCode, {
      props: { code: 'const answer = 42;', language: 'javascript', copyable: false },
    });

    // 无需等待异步加载：高亮是同步的。
    expect(wrapper.find('.ex-token-keyword').text()).toBe('const');
    expect(wrapper.find('.ex-token-number').text()).toBe('42');
  });

  it('用户代码中的 HTML 不会被当作真实标签渲染（XSS 防护）', () => {
    const wrapper = mount(ExCode, {
      props: { code: '<img src=x onerror=alert(1)>', language: 'plaintext', copyable: false },
    });
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.ex-code__line-content').text()).toContain('<img');
  });

  it('显示行号时行号数量应与代码行数一致', () => {
    const wrapper = mount(ExCode, {
      props: {
        code: 'a\nb\nc',
        language: 'plaintext',
        lineNumbers: true,
        startLine: 5,
        copyable: false,
      },
    });

    const gutters = wrapper.findAll('.ex-code__gutter');
    expect(gutters).toHaveLength(3);
    // start-line 生效。
    expect(gutters[0].text()).toBe('5');
    expect(gutters[2].text()).toBe('7');
  });

  it('非法 startLine 与 tabSize 不会产生 Infinity 行号或编辑异常', async () => {
    const wrapper = mount(ExCode, {
      props: {
        code: 'a\nb',
        editable: true,
        lineNumbers: true,
        startLine: Number.POSITIVE_INFINITY,
        tabSize: Number.POSITIVE_INFINITY,
        copyable: false,
      },
    });

    expect(wrapper.findAll('.ex-code__gutter').map(item => item.text())).toEqual(['1', '2']);
    const textarea = wrapper.find('textarea');
    const element = textarea.element as HTMLTextAreaElement;
    element.selectionStart = 0;
    element.selectionEnd = 0;
    await expect(textarea.trigger('keydown', { key: 'Tab' })).resolves.toBeUndefined();
    expect(wrapper.emitted('update:code')?.[0]).toEqual(['  a\nb']);
  });

  it('highlight-lines 应高亮指定行（基于展示行号）', () => {
    const wrapper = mount(ExCode, {
      props: {
        code: 'a\nb\nc\nd',
        lineNumbers: true,
        highlightLines: '2,4',
        copyable: false,
      },
    });

    const lines = wrapper.findAll('.ex-code__line');
    expect(lines[0].classes()).not.toContain('ex-code__line--highlighted');
    expect(lines[1].classes()).toContain('ex-code__line--highlighted');
    expect(lines[3].classes()).toContain('ex-code__line--highlighted');
  });

  it('可编辑模式应同步 v-model 事件、行号与暴露方法', async () => {
    const wrapper = mount(ExCode, {
      props: {
        code: 'let count = 1;',
        language: 'javascript',
        editable: true,
        lineNumbers: true,
        copyable: false,
      },
    });

    const nextCode = 'let count = 1;\ncount += 1;';
    await wrapper.find('textarea').setValue(nextCode);

    expect(wrapper.emitted('update:code')?.[0]).toEqual([nextCode]);
    expect(wrapper.emitted('change')?.[0]).toEqual([nextCode]);
    expect(wrapper.findAll('.ex-code__gutter')).toHaveLength(2);
    expect((wrapper.vm as unknown as { getCode: () => string }).getCode()).toBe(nextCode);
  });

  it('编辑模式按 Tab 应插入缩进并阻止默认行为', async () => {
    const wrapper = mount(ExCode, {
      props: { code: 'a', language: 'plaintext', editable: true, tabSize: 2, copyable: false },
    });

    const textarea = wrapper.find('textarea');
    const el = textarea.element as HTMLTextAreaElement;
    el.selectionStart = 0;
    el.selectionEnd = 0;

    const preventDefault = vi.fn();
    await textarea.trigger('keydown', { key: 'Tab', preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(wrapper.emitted('update:code')?.[0]).toEqual(['  a']);
  });

  it('多行选区结束在下一行行首时不应额外缩进该行', async () => {
    const wrapper = mount(ExCode, {
      props: { code: 'a\nb\nc', editable: true, tabSize: 2, copyable: false },
    });
    const textarea = wrapper.find('textarea');
    const element = textarea.element as HTMLTextAreaElement;
    element.selectionStart = 0;
    element.selectionEnd = 2;

    await textarea.trigger('keydown', { key: 'Tab' });

    expect(wrapper.emitted('update:code')?.[0]).toEqual(['  a\nb\nc']);
  });

  it('tab-size 同时控制插入宽度与已有制表符的视觉宽度', () => {
    const wrapper = mount(ExCode, {
      props: { code: '\tvalue', editable: true, tabSize: 6, copyable: false },
    });

    expect(wrapper.attributes('style')).toContain('--ex-code-tab-size: 6');
  });

  it('只读编辑模式下 textarea 应带 readonly', () => {
    const wrapper = mount(ExCode, {
      props: { code: 'x', editable: true, readonly: true, copyable: false },
    });
    expect(wrapper.find('textarea').attributes('readonly')).toBeDefined();
  });

  it('编辑态高亮副本对辅助技术隐藏且复制反馈使用 live region', () => {
    const wrapper = mount(ExCode, {
      props: { code: 'const value = 1;', editable: true, copyable: true },
    });

    expect(
      wrapper.findAll('.ex-code__line').every(line => line.attributes('aria-hidden') === 'true')
    ).toBe(true);
    expect(wrapper.get('.ex-code__copy-text').attributes('aria-live')).toBe('polite');
  });

  it('复制按钮应复制当前代码并派发 copy 事件', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const wrapper = mount(ExCode, {
      props: { code: 'console.log("copy");', language: 'javascript' },
    });

    await wrapper.find('.ex-code__copy-btn').trigger('click');

    expect(writeText).toHaveBeenCalledWith('console.log("copy");');
    expect(wrapper.emitted('copy')?.[0]).toEqual(['console.log("copy");']);
  });

  it('异步复制期间外部代码变化时，copy 事件仍对应实际写入的快照', async () => {
    let resolveWrite: (() => void) | undefined;
    const writeText = vi.fn(() => new Promise<void>(resolve => (resolveWrite = resolve)));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const wrapper = mount(ExCode, { props: { code: 'before' } });
    const copying = (wrapper.vm as unknown as ExCodeExposed).copy();

    await wrapper.setProps({ code: 'after' });
    resolveWrite?.();
    await copying;

    expect(writeText).toHaveBeenCalledWith('before');
    expect(wrapper.emitted('copy')?.[0]).toEqual(['before']);
  });

  it('clipboard 不可用时应降级到 execCommand', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });

    const wrapper = mount(ExCode, { props: { code: 'fallback', language: 'plaintext' } });
    await wrapper.find('.ex-code__copy-btn').trigger('click');

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(wrapper.emitted('copy')?.[0]).toEqual(['fallback']);
  });

  it('降级复制完成后恢复原有焦点', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    const wrapper = mount(ExCode, { props: { code: 'fallback' }, attachTo: document.body });

    await (wrapper.vm as unknown as ExCodeExposed).copy();

    expect(document.activeElement).toBe(input);
    wrapper.unmount();
    input.remove();
  });

  it('降级复制返回 false 时不宣称复制成功', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    const wrapper = mount(ExCode, { props: { code: 'not-copied' } });
    const exposed = wrapper.vm as unknown as ExCodeExposed;

    await expect(exposed.copy()).resolves.toBe(false);
    expect(wrapper.emitted('copy')).toBeUndefined();
    expect(wrapper.find('.ex-code__copy-btn').classes()).not.toContain('ex-code__copy-btn--copied');
  });

  it('剪贴板拒绝写入时返回 false 并派发 copy-error', async () => {
    const copyError = new Error('permission denied');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(copyError) },
    });
    const wrapper = mount(ExCode, { props: { code: 'denied' } });
    const exposed = wrapper.vm as unknown as ExCodeExposed;

    await expect(exposed.copy()).resolves.toBe(false);
    expect(wrapper.emitted('copy-error')?.[0]).toEqual([copyError]);
    expect(wrapper.emitted('copy')).toBeUndefined();
  });

  it('上一次复制成功后再次复制失败会立即清除成功状态', async () => {
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('x'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const wrapper = mount(ExCode, { props: { code: 'value' } });
    const exposed = wrapper.vm as unknown as ExCodeExposed;

    await exposed.copy();
    expect(wrapper.find('.ex-code__copy-btn').classes()).toContain('ex-code__copy-btn--copied');
    await exposed.copy();

    expect(wrapper.find('.ex-code__copy-btn').classes()).not.toContain('ex-code__copy-btn--copied');
  });

  it('max-height 应作用于内容滚动容器', () => {
    const wrapper = mount(ExCode, {
      props: { code: 'a\nb', maxHeight: 200, copyable: false },
    });
    expect(wrapper.find('.ex-code__content').attributes('style')).toContain('max-height: 200px');
  });

  it('外部更新 :code 应同步到展示内容', async () => {
    const wrapper = mount(ExCode, {
      props: { code: 'old', language: 'plaintext', copyable: false },
    });
    await wrapper.setProps({ code: 'new value' });
    await nextTick();
    expect(wrapper.find('.ex-code__line-content').text()).toBe('new value');
  });
});
