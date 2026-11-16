import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExFormItem from '../../src/components/form/ExFormItem.vue';
import ExProgress from '../../src/components/progress/ExProgress.vue';
import ExRate from '../../src/components/rate/ExRate.vue';
import ExSlider from '../../src/components/slider/ExSlider.vue';

enableAutoUnmount(afterEach);

describe('数值控件的可访问名称与值', () => {
  it('双滑块关联实际表单标题及各自的端点，并暴露格式化值', () => {
    const wrapper = mount(
      {
        render: () =>
          h(
            ExFormItem,
            { label: '预算', showColon: false },
            {
              default: () =>
                h(ExSlider, {
                  range: true,
                  modelValue: [20, 60],
                  formatTooltip: value => `${value} 元`,
                }),
            }
          ),
      },
      { attachTo: document.body }
    );

    const thumbs = wrapper.findAll('[role="slider"]');
    const labels = thumbs.map(thumb => {
      const ids = thumb.attributes('aria-labelledby')?.split(' ');
      return ids?.map(id => document.getElementById(id)?.textContent?.trim());
    });
    expect(labels).toEqual([
      ['预算', expect.any(String)],
      ['预算', expect.any(String)],
    ]);
    expect(labels[0]![1]).not.toBe(labels[1]![1]);
    expect(thumbs.map(thumb => thumb.attributes('aria-valuetext'))).toEqual(['20 元', '60 元']);
  });

  it('单滑块也读出格式化值，且隐去空格式化文本', async () => {
    const wrapper = mount(ExSlider, {
      props: { modelValue: 50, formatTooltip: value => `${value} 元` },
    });
    const thumb = wrapper.get('[role="slider"]');
    expect(thumb.attributes('aria-valuetext')).toBe('50 元');
    await wrapper.setProps({ formatTooltip: () => '' });
    expect(thumb.attributes('aria-valuetext')).toBeUndefined();
  });

  it('没有表单标题时，双滑块用组件名称区分端点，数值默认保留数字播报', () => {
    const wrapper = mount(ExSlider, {
      props: { range: true, ariaLabel: '预算区间', modelValue: [0, 50] },
    });
    const thumbs = wrapper.findAll('[role="slider"]');
    expect(thumbs.every(thumb => thumb.attributes('aria-label')?.startsWith('预算区间 '))).toBe(
      true
    );
    expect(thumbs[0]!.attributes('aria-label')).not.toBe(thumbs[1]!.attributes('aria-label'));
    expect(thumbs[0]!.attributes('aria-valuetext')).toBeUndefined();
  });

  it('评分提示可以预览，读屏值仍对应确认的评分', async () => {
    const wrapper = mount(ExRate, {
      props: { modelValue: 2, showText: true, texts: ['差', '一般', '好', '很好', '优秀'] },
    });
    const rate = wrapper.get('[role="slider"]');
    expect(rate.attributes('aria-valuetext')).toBe('一般');
    await wrapper.findAll('.ex-rate__star')[2]!.trigger('mouseenter');
    expect(wrapper.text()).toContain('好');
    expect(rate.attributes('aria-valuenow')).toBe('2');
    expect(rate.attributes('aria-valuetext')).toBe('一般');
  });

  it('半星与相邻整星共用评价文字时，仍能从读屏值区分', async () => {
    const wrapper = mount(ExRate, {
      props: { modelValue: 2.5, allowHalf: true, showText: true, texts: ['差', '一般', '好'] },
    });
    const rate = wrapper.get('[role="slider"]');
    expect(rate.attributes('aria-valuetext')).toBe('好 (2.5)');
    await wrapper.setProps({ modelValue: 3 });
    expect(rate.attributes('aria-valuetext')).toBe('好 (3)');
  });

  it('进度条提供自定义语义，移除格式化后恢复默认数值播报', async () => {
    const wrapper = mount(ExProgress, {
      props: { percentage: 40, format: value => `已完成 ${value} 件` },
    });
    const progress = wrapper.get('[role="progressbar"]');
    expect(progress.attributes('aria-valuenow')).toBe('40');
    expect(progress.attributes('aria-valuetext')).toBe('已完成 40 件');
    await wrapper.setProps({ format: undefined });
    expect(progress.attributes('aria-valuetext')).toBeUndefined();
  });
});
