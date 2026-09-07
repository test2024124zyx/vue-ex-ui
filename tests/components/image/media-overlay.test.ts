import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExModal from '../../../src/components/modal/ExModal.vue';
import ExImage from '../../../src/components/image/ExImage.vue';
import ExFilePreview from '../../../src/components/file-preview/ExFilePreview.vue';
import ExHeatmap from '../../../src/components/heatmap/ExHeatmap.vue';

describe('媒体浮层生命周期与主题', () => {
  const wrappers: VueWrapper[] = [];
  afterEach(() => {
    wrappers
      .splice(0)
      .reverse()
      .forEach(wrapper => wrapper.unmount());
    document.body.innerHTML = '';
  });

  const cases = [
    {
      kind: 'image',
      selector: '.ex-image-preview',
      render: () => h(ExImage, { src: '/a.png', preview: true, alt: 'a' }),
    },
    {
      kind: 'preview',
      selector: '.ex-file-preview',
      render: () => h(ExFilePreview, { visible: true, file: '/a.png' }),
    },
    {
      kind: 'heatmap',
      selector: '.ex-heatmap__tooltip',
      render: () =>
        h(ExHeatmap, {
          data: [{ date: '2024-01-01', value: 1 }],
          startDate: '2024-01-01',
          endDate: '2024-01-07',
        }),
    },
  ];

  it.each(cases)('$kind 跟随父级层级、品牌变量和实际关闭状态', async entry => {
    const visible = ref(true);
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { themeOverrides: { '--ex-color-primary': '#aa0033' } },
      slots: {
        default: () =>
          h(ExModal, { modelValue: visible.value, zIndex: 5000 }, { default: entry.render }),
      },
    });
    wrappers.push(wrapper);
    await flushPromises();
    if (entry.kind === 'image') {
      const image = wrapper.findComponent(ExImage);
      await image.find('img').trigger('load');
      await image.find('button').trigger('click');
    } else if (entry.kind === 'heatmap') {
      await wrapper.findComponent(ExHeatmap).find('.ex-heatmap__cell').trigger('mouseenter');
    }
    await flushPromises();
    const panel = document.querySelector<HTMLElement>(entry.selector)!;
    expect(Number(panel.style.zIndex)).toBeGreaterThan(5000);
    expect(panel.style.getPropertyValue('--ex-color-primary')).toBe('#aa0033');
    visible.value = false;
    await flushPromises();
    expect(document.querySelector(entry.selector)).toBeNull();
  });

  it('热力图悬停提示允许从当前焦点按 Escape 关闭', async () => {
    const wrapper = mount(ExHeatmap, {
      attachTo: document.body,
      props: {
        data: [{ date: '2024-01-01', value: 1 }],
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      },
    });
    wrappers.push(wrapper);
    await wrapper.find('.ex-heatmap__cell').trigger('mouseenter');
    await nextTick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(document.querySelector('.ex-heatmap__tooltip')).toBeNull();
  });

  it.each(['srcset', 'sizes'] as const)(
    '图片失败后更新 %s 会重新创建原生图片并清理失败状态',
    async property => {
      const wrapper = mount(ExImage, {
        props: { src: '/a.png', alt: 'a', srcset: '/bad.png 1x', sizes: '100vw' },
      });
      wrappers.push(wrapper);
      await wrapper.find('img').trigger('error');
      await wrapper.setProps({ [property]: property === 'srcset' ? '/good.png 1x' : '50vw' });
      expect(wrapper.find('img').exists()).toBe(true);
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    }
  );

  it.each(['video', 'audio', 'pdf'] as const)(
    '%s 加载失败提供可访问的错误反馈，换源后恢复加载态',
    async type => {
      const wrapper = mount(ExFilePreview, {
        attachTo: document.body,
        props: { visible: true, file: { url: '/asset', type } },
      });
      wrappers.push(wrapper);
      await flushPromises();
      document.querySelector(type === 'pdf' ? 'iframe' : type)!.dispatchEvent(new Event('error'));
      await nextTick();
      expect(wrapper.emitted('error')).toHaveLength(1);
      expect(document.querySelector('.ex-file-preview [role="alert"]')).not.toBeNull();
      await wrapper.setProps({ file: { url: '/replacement', type } });
      expect(document.querySelector('.ex-file-preview [role="alert"]')).toBeNull();
      expect(document.querySelector('.ex-file-preview [role="status"]')).not.toBeNull();
    }
  );
});
