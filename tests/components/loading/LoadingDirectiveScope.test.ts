import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import LoadingPlugin from '../../../src/components/loading/LoadingService';

describe('加载指令的配置作用域', () => {
  it('DOM 宿主不导出 HTMLDivElement 时仍能取得并清理 Provider 根元素', () => {
    vi.stubGlobal('HTMLDivElement', undefined);
    try {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: { default: () => h('span', '内容') },
      });
      try {
        expect(wrapper.vm.getElement()).toBe(wrapper.element);
      } finally {
        wrapper.unmount();
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('直接插槽内的指令继承最近 Provider，并响应尺寸和语言变化', async () => {
    const wrapper = mount(
      {
        components: { ExConfigProvider },
        data: () => ({ size: 'small', locale: 'zh-CN' }),
        template:
          '<ExConfigProvider :size="size" :locale="locale"><section v-loading="true" /></ExConfigProvider>',
      },
      {
        attachTo: document.body,
        global: { plugins: [LoadingPlugin] },
      }
    );
    await flushPromises();
    expect(wrapper.get('.ex-loading').classes()).toContain('ex-loading--small');
    expect(wrapper.get('.ex-loading').attributes('aria-label')).toBe('加载中...');
    await wrapper.setData({ size: 'large', locale: 'en-US' });
    await flushPromises();
    expect(wrapper.get('.ex-loading').classes()).toContain('ex-loading--large');
    expect(wrapper.get('.ex-loading').attributes('aria-label')).toBe('Loading...');
    wrapper.unmount();
    expect(document.querySelector('.ex-loading')).toBeNull();
  });

  it('子组件指令独立于其他 Provider，显式指令尺寸优先', async () => {
    const Child = defineComponent({
      template: '<section v-loading="{loading:true,config:{size:\'large\'}}" />',
    });
    const wrapper = mount(ExConfigProvider, {
      props: { size: 'small' },
      slots: { default: () => h(Child) },
      global: { plugins: [LoadingPlugin] },
    });
    await flushPromises();
    expect(wrapper.get('.ex-loading').classes()).toContain('ex-loading--large');
    wrapper.unmount();
  });
});
