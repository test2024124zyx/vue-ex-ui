import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExPageHeader from '../../../src/components/page-header/ExPageHeader.vue';

describe('ExPageHeader', () => {
  it('标签类型与文档承诺的 ExTag 类型保持一致', () => {
    const wrapper = mount(ExPageHeader, {
      props: {
        title: '项目',
        tags: [
          { id: 'danger', text: '高风险', type: 'danger' },
          { id: 'info', text: '说明', type: 'info' },
        ],
      },
    });

    expect(wrapper.findAll('.ex-page-header__tag')).toHaveLength(2);
  });

  it('非法高度回退为 auto，合法 CSS 长度得到规范化', async () => {
    const wrapper = mount(ExPageHeader, { props: { height: 'garbage' } });
    expect(wrapper.get('header').attributes('style')).toContain('height: auto');

    await wrapper.setProps({ height: 72 });
    expect(wrapper.get('header').attributes('style')).toContain('height: 72px');
  });

  it('固定层级默认继承 ConfigProvider，并允许显式覆盖', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: { zIndex: 3000 },
      slots: { default: () => h(ExPageHeader, { title: '固定', fixed: true }) },
    });

    expect(wrapper.get('header').attributes('style')).toContain('z-index: 3020');
    const explicit = mount(ExPageHeader, {
      props: { title: '显式固定', fixed: true, zIndex: 4500 },
    });
    expect(explicit.get('header').attributes('style')).toContain('z-index: 4500');
  });
});
