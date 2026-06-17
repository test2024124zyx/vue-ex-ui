import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExDescriptions from '../../../src/components/descriptions/ExDescriptions.vue';
import ExDescriptionsItem from '../../../src/components/descriptions/ExDescriptionsItem.vue';

const mountDesc = (props = {}, items: Array<{ label: string; content: string; span?: number }> = []) =>
  mount(ExDescriptions, {
    props,
    slots: {
      default: () =>
        items.map(it =>
          h(ExDescriptionsItem, { label: it.label, span: it.span }, { default: () => it.content })
        ),
    },
  });

describe('ExDescriptions', () => {
  it('渲染标签与内容', () => {
    const wrapper = mountDesc({ title: '信息' }, [
      { label: '用户名', content: 'Edge' },
      { label: '城市', content: 'Tokyo' },
    ]);
    expect(wrapper.find('.ex-descriptions__title').text()).toBe('信息');
    const labels = wrapper.findAll('.ex-descriptions__label');
    const contents = wrapper.findAll('.ex-descriptions__content');
    expect(labels.length).toBe(2);
    expect(labels[0]!.text()).toContain('用户名');
    expect(contents[0]!.text()).toContain('Edge');
  });

  it('border 模式添加边框类', () => {
    const wrapper = mountDesc({ border: true }, [{ label: 'a', content: '1' }]);
    expect(wrapper.find('.ex-descriptions').classes()).toContain('ex-descriptions--border');
  });

  it('按 column 分行，最后一项填满剩余列（horizontal colspan）', () => {
    const wrapper = mountDesc({ column: 3, border: true }, [
      { label: 'a', content: '1' },
      { label: 'b', content: '2' },
    ]);
    // 第一行只有两项，最后一项内容单元格 colspan 扩展填满（span 2 -> colspan 3）
    const contents = wrapper.findAll('.ex-descriptions__content');
    const lastColspan = contents[contents.length - 1]!.attributes('colspan');
    expect(Number(lastColspan)).toBeGreaterThan(1);
  });

  it('vertical 方向标签行与内容行分离', () => {
    const wrapper = mountDesc({ direction: 'vertical', border: true }, [
      { label: 'a', content: '1' },
      { label: 'b', content: '2' },
    ]);
    const rows = wrapper.findAll('.ex-descriptions__row');
    // 一组（两项）在 vertical 下产生 2 行：标签行 + 内容行
    expect(rows.length).toBe(2);
  });

  it('尊重 span 设置', () => {
    const wrapper = mountDesc({ column: 4, border: true }, [
      { label: 'a', content: '1', span: 2 },
      { label: 'b', content: '2' },
    ]);
    const contents = wrapper.findAll('.ex-descriptions__content');
    // 第一项 span=2 -> colspan = 2*2-1 = 3
    expect(contents[0]!.attributes('colspan')).toBe('3');
  });
});
