import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExDescriptions from '../../../src/components/descriptions/ExDescriptions.vue';
import ExDescriptionsItem from '../../../src/components/descriptions/ExDescriptionsItem.vue';

const mountDesc = (
  props = {},
  items: Array<{ label: string; content: string; span?: number }> = []
) =>
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

  it('规范化非有限、小数与非正 column/span，绝不生成非法 colspan', () => {
    const wrapper = mountDesc({ column: Number.POSITIVE_INFINITY }, [
      { label: 'a', content: '1', span: Number.NaN },
      { label: 'b', content: '2', span: -2 },
      { label: 'c', content: '3', span: 1.8 },
    ]);

    const colspans = wrapper.findAll('[colspan]').map(cell => Number(cell.attributes('colspan')));
    expect(colspans.every(value => Number.isInteger(value) && value > 0)).toBe(true);
    expect(wrapper.findAll('.ex-descriptions__row')).toHaveLength(1);
  });

  it('通过 headers 显式关联每一组标签与内容，并用标题标记表格', () => {
    const wrapper = mountDesc({ title: '账户信息' }, [
      { label: '用户名', content: 'Edge' },
      { label: '城市', content: 'Tokyo' },
    ]);
    const table = wrapper.find('table');
    const title = wrapper.find('.ex-descriptions__title');
    const labels = wrapper.findAll('th');
    const contents = wrapper.findAll('td');

    expect(title.attributes('id')).toBeTruthy();
    expect(table.attributes('aria-labelledby')).toBe(title.attributes('id'));
    expect(contents[0]!.attributes('headers')).toBe(labels[0]!.attributes('id'));
    expect(contents[1]!.attributes('headers')).toBe(labels[1]!.attributes('id'));
  });

  it('只有 extra 插槽时不渲染空标题节点', () => {
    const wrapper = mount(ExDescriptions, {
      slots: {
        extra: () => h('button', 'Action'),
        default: () => h(ExDescriptionsItem, { label: 'a' }, () => '1'),
      },
    });
    expect(wrapper.find('.ex-descriptions__header').exists()).toBe(true);
    expect(wrapper.find('.ex-descriptions__title').exists()).toBe(false);
  });

  it('无标签项不渲染孤立冒号', () => {
    const wrapper = mount(ExDescriptions, {
      slots: {
        default: () => h(ExDescriptionsItem, {}, () => '仅内容'),
      },
    });
    expect(wrapper.find('.ex-descriptions__colon').exists()).toBe(false);
    expect(wrapper.find('.ex-descriptions__content').text()).toBe('仅内容');
  });

  it('响应式插槽项增删后重新计算表格布局', async () => {
    const visible = ref(true);
    const wrapper = mount(ExDescriptions, {
      props: { column: 2 },
      slots: {
        default: () => [
          h(ExDescriptionsItem, { label: '固定项' }, () => 'A'),
          visible.value ? h(ExDescriptionsItem, { label: '动态项' }, () => 'B') : null,
        ],
      },
    });
    expect(wrapper.findAll('.ex-descriptions__label')).toHaveLength(2);

    visible.value = false;
    await nextTick();
    expect(wrapper.findAll('.ex-descriptions__label')).toHaveLength(1);
    expect(wrapper.find('.ex-descriptions__content').attributes('colspan')).toBe('3');
  });

  it('DescriptionsItem 脱离父容器时明确拒绝伪回退渲染', () => {
    expect(() => mount(ExDescriptionsItem, { slots: { default: () => 'orphan' } })).toThrow(
      'ExDescriptionsItem 必须作为 ExDescriptions 的直接子项使用'
    );
  });

  it('项目级样式覆盖全局样式，同时保留两者未冲突的属性', () => {
    const wrapper = mount(ExDescriptions, {
      props: { labelStyle: { color: 'red', paddingLeft: '4px' } },
      slots: {
        default: () =>
          h(
            ExDescriptionsItem,
            {
              label: '字段',
              labelClass: ['custom-label'],
              labelStyle: { color: 'blue', fontWeight: '700' },
            },
            () => '内容'
          ),
      },
    });
    const label = wrapper.find('.ex-descriptions__label');
    expect(label.classes()).toContain('custom-label');
    expect(label.attributes('style')).toContain('color: blue');
    expect(label.attributes('style')).toContain('padding-left: 4px');
    expect(label.attributes('style')).toContain('font-weight: 700');
  });

  it('自定义标签插槽仍与对应内容保持可访问关联', () => {
    const wrapper = mount(ExDescriptions, {
      slots: {
        default: () =>
          h(
            ExDescriptionsItem,
            {},
            {
              label: () => h('strong', '自定义标签'),
              default: () => '内容',
            }
          ),
      },
    });
    const label = wrapper.find('th');
    const content = wrapper.find('td');
    expect(label.text()).toContain('自定义标签');
    expect(content.attributes('headers')).toBe(label.attributes('id'));
  });
});
