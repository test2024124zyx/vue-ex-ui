import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExPageHeader from '../../../src/components/page-header/ExPageHeader.vue';
import ExTag from '../../../src/components/tag/ExTag.vue';

describe('页头内容与导航契约', () => {
  it('返回与面包屑只请求导航，并保持当前页标识', async () => {
    const wrapper = mount(ExPageHeader, {
      props: {
        title: '订单详情',
        subtitle: '订单编号 001',
        showBack: true,
        backText: '返回订单',
        breadcrumb: [{ id: 'home', title: '首页', path: '/' }, { title: '当前页' }],
        avatar: { src: '/avatar.png', alt: '负责人' },
      },
    });
    await wrapper.get('.ex-page-header__back').trigger('click');
    await wrapper.get('.ex-page-header__breadcrumb-link').trigger('click');
    expect(wrapper.emitted('back')).toHaveLength(1);
    expect(wrapper.emitted('breadcrumb-click')).toEqual([['/', 0]]);
    expect(wrapper.get('[aria-current="page"]').element.tagName).toBe('SPAN');
    expect(wrapper.get('h1').text()).toBe('订单详情');
    expect(wrapper.get('img').attributes('alt')).toBe('负责人');
    expect(wrapper.get('.ex-page-header__subtitle').text()).toBe('订单编号 001');
    wrapper.unmount();
  });

  it('遗留标签类型、无类型与自定义颜色传递给真实标签组件', () => {
    const wrapper = mount(ExPageHeader, {
      props: {
        tags: [
          { text: '默认', type: 'default' },
          { text: '失败', type: 'error' },
          { text: '未指定' },
          { text: '自定义', type: 'success', color: '#123456' },
        ],
      },
    });
    const tags = wrapper.findAllComponents(ExTag);
    expect(tags[1]!.props('type')).toBe('danger');
    expect(tags[3]!.props('bgColor')).toBe('#123456');
    expect(tags.map(tag => tag.text())).toEqual(['默认', '失败', '未指定', '自定义']);
    wrapper.unmount();
  });

  it('所有内容插槽覆盖默认内容且保留结构语义', () => {
    const wrapper = mount(ExPageHeader, {
      props: { title: '不应出现', showBack: true, backIcon: 'home-line', showDivider: false },
      slots: {
        breadcrumb: () => h('a', { href: '/orders' }, '订单路径'),
        back: () => h('button', '自定义返回'),
        avatar: () => h('span', '业务头像'),
        title: () => '自定义标题',
        subtitle: () => '补充信息',
        tags: () => '标签区',
        extra: () => h('button', '保存'),
        default: () => '业务内容',
        footer: () => '页脚内容',
      },
    });
    expect(wrapper.get('h1').text()).toBe('自定义标题');
    expect(wrapper.text()).not.toContain('不应出现');
    for (const selector of ['breadcrumb', 'extra', 'content', 'footer', 'tags']) {
      expect(wrapper.get(`.ex-page-header__${selector}`).text()).not.toBe('');
    }
    expect(wrapper.classes()).not.toContain('ex-page-header--with-divider');
    wrapper.unmount();
  });
});
