import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';

describe('级联选项内容扩展', () => {
  let wrapper: ReturnType<typeof mount> | undefined;
  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  const options = [
    {
      value: 'platform',
      label: '平台',
      count: 3,
      children: [{ value: 'frontend', label: '前端' }],
    },
  ];

  it('选项插槽接收业务数据和层级，仍按真实路径选择', async () => {
    wrapper = mount(ExCascader, {
      props: { options },
      slots: {
        option: ({ option, level }) => h('span', `${level}:${option.label}:${option.count ?? ''}`),
      },
      attachTo: document.body,
    });
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });
    expect(document.querySelector('.ex-cascader__option-content')?.textContent).toBe('0:平台:3');
    await wrapper.find('input').trigger('keydown', { key: 'ArrowRight' });
    expect(document.querySelectorAll('.ex-cascader__option-content')[1]?.textContent).toBe(
      '1:前端:'
    );
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['platform', 'frontend']]);
  });

  it('搜索结果插槽替换完整展示路径并保留键盘提交，空内容插槽覆盖无匹配状态', async () => {
    wrapper = mount(ExCascader, {
      props: { options, filterable: true },
      slots: {
        'search-result': ({ labels, values }) =>
          h('span', `${labels.join('>')} (${values.length})`),
        empty: () => h('span', '没有符合条件的部门'),
      },
      attachTo: document.body,
    });
    await wrapper.find('input').setValue('前端');
    expect(document.querySelector('.ex-cascader__search-result-content')?.textContent).toBe(
      '平台>前端 (2)'
    );
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' });
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['platform', 'frontend']]);
    await wrapper.find('input').setValue('无匹配');
    expect(document.querySelector('.ex-cascader__empty')?.textContent).toContain(
      '没有符合条件的部门'
    );
  });
});
