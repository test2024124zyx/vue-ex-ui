import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExCode from '../../../src/components/code/ExCode.vue';

describe('ExCode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('默认 plaintext 应该按纯文本渲染，不生成高亮 span 标签', async () => {
    const code = '<span class="danger" onclick="alert(1)">文本</span>';
    const wrapper = mount(ExCode, {
      props: {
        code,
        copyable: false,
        showLanguage: false,
      },
    });

    await flushPromises();

    const codeElement = wrapper.find('.ex-code__code');
    expect(codeElement.text()).toBe(code);
    expect(codeElement.find('span').exists()).toBe(false);
  });

  it('指定 javascript 时应该渲染语法高亮 token', async () => {
    const wrapper = mount(ExCode, {
      props: {
        code: 'const answer = 42;',
        language: 'javascript',
        copyable: false,
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find('.ex-code__code .hljs-keyword').text()).toBe('const');
  });

  it('可编辑模式应该同步 v-model 事件和暴露方法', async () => {
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
    expect(wrapper.findAll('.ex-code__line-number')).toHaveLength(2);
    expect((wrapper.vm as { getCode: () => string }).getCode()).toBe(nextCode);
  });

  it('复制按钮应该复制当前代码并派发 copy 事件', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const wrapper = mount(ExCode, {
      props: {
        code: 'console.log("copy");',
        language: 'javascript',
      },
    });

    await wrapper.find('.ex-code__copy-btn').trigger('click');

    expect(writeText).toHaveBeenCalledWith('console.log("copy");');
    expect(wrapper.emitted('copy')?.[0]).toEqual(['console.log("copy");']);
  });
});
