import { Comment, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExDivider from '../../../src/components/divider/ExDivider.vue';

describe('ExDivider', () => {
  it('默认渲染无名称的水平分隔线和单条装饰线', () => {
    const wrapper = mount(ExDivider);

    expect(wrapper.classes()).toContain('ex-divider--horizontal');
    expect(wrapper.classes()).toContain('ex-divider--size-default');
    expect(wrapper.attributes('role')).toBe('separator');
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal');
    expect(wrapper.attributes('aria-label')).toBeUndefined();
    expect(wrapper.findAll('.ex-divider__line')).toHaveLength(1);
    expect(wrapper.find('.ex-divider__content').exists()).toBe(false);
  });

  it('有意义的标题内容渲染在两段线之间', () => {
    const wrapper = mount(ExDivider, {
      slots: { default: () => h('strong', '章节标题') },
    });

    expect(wrapper.classes()).toContain('ex-divider--center');
    expect(wrapper.findAll('.ex-divider__line')).toHaveLength(2);
    expect(wrapper.find('.ex-divider__content strong').text()).toBe('章节标题');
  });

  it('忽略注释和空白组成的空插槽', () => {
    const wrapper = mount(ExDivider, {
      slots: { default: () => [h(Comment), '   '] },
    });

    expect(wrapper.find('.ex-divider__content').exists()).toBe(false);
    expect(wrapper.findAll('.ex-divider__line')).toHaveLength(1);
    expect(wrapper.classes()).not.toContain('ex-divider--center');
  });

  it('垂直分割线忽略标题并声明垂直方向', () => {
    const wrapper = mount(ExDivider, {
      props: { type: 'vertical' },
      slots: { default: '不会渲染' },
    });

    expect(wrapper.classes()).toContain('ex-divider--vertical');
    expect(wrapper.attributes('aria-orientation')).toBe('vertical');
    expect(wrapper.find('.ex-divider__content').exists()).toBe(false);
    expect(wrapper.findAll('.ex-divider__line--vertical')).toHaveLength(1);
  });

  it.each(['left', 'center', 'right'] as const)('标题支持 %s 方位', orientation => {
    const wrapper = mount(ExDivider, {
      props: { orientation },
      slots: { default: '标题' },
    });

    expect(wrapper.classes()).toContain(`ex-divider--${orientation}`);
  });

  it.each(['small', 'default', 'large'] as const)('支持 %s 预设尺寸', size => {
    const wrapper = mount(ExDivider, { props: { size } });
    expect(wrapper.classes()).toContain(`ex-divider--size-${size}`);
  });

  it('非法运行时枚举稳定回退到默认值', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'diagonal' as never,
        orientation: 'outside' as never,
        size: 'huge' as never,
      },
      slots: { default: '标题' },
    });

    expect(wrapper.classes()).toContain('ex-divider--horizontal');
    expect(wrapper.classes()).toContain('ex-divider--center');
    expect(wrapper.classes()).toContain('ex-divider--size-default');
  });

  it('正的有限数字尺寸写入 CSS 变量', () => {
    const wrapper = mount(ExDivider, { props: { size: 5 } });
    expect(wrapper.attributes('style')).toContain('--ex-divider-size: 5px');
  });

  it.each([0, -1, Number.POSITIVE_INFINITY, Number.NaN])('非法数字尺寸 %s 不生成无效 CSS', size => {
    const wrapper = mount(ExDivider, { props: { size } });
    expect(wrapper.classes()).toContain('ex-divider--size-default');
    expect(wrapper.attributes('style') || '').not.toContain('--ex-divider-size');
  });

  it('水平和垂直间距沿各自主轴应用', async () => {
    const wrapper = mount(ExDivider, { props: { margin: 20 } });
    expect(wrapper.attributes('style')).toContain('--ex-divider-margin: 20px 0');

    await wrapper.setProps({ type: 'vertical' });
    expect(wrapper.attributes('style')).toContain('--ex-divider-margin: 0 20px');
  });

  it('非有限数字间距不会写入 CSS', () => {
    const wrapper = mount(ExDivider, {
      props: { margin: Number.POSITIVE_INFINITY },
    });
    expect(wrapper.attributes('style') || '').not.toContain('--ex-divider-margin');
  });

  it('orientationMargin 只对带标题的 left/right 水平分隔线生效', async () => {
    const wrapper = mount(ExDivider, {
      props: { orientation: 'left', orientationMargin: 24 },
      slots: { default: '标题' },
    });
    expect(wrapper.attributes('style')).toContain('--ex-divider-orientation-margin: 24px');

    await wrapper.setProps({ orientation: 'center' });
    expect(wrapper.attributes('style') || '').not.toContain('--ex-divider-orientation-margin');
  });

  it('无标题时不宣称 orientationMargin 与 plain 生效', () => {
    const wrapper = mount(ExDivider, {
      props: { orientation: 'left', orientationMargin: '10%', plain: true },
    });

    expect(wrapper.attributes('style') || '').not.toContain('--ex-divider-orientation-margin');
    expect(wrapper.classes()).not.toContain('ex-divider--plain');
  });

  it('自定义颜色通过稳定 CSS 变量透传', () => {
    const wrapper = mount(ExDivider, { props: { color: '#00f0ff' } });
    expect(wrapper.attributes('style')).toContain('--ex-divider-color: #00f0ff');
  });

  it('虚线与朴素标题样式可组合', () => {
    const wrapper = mount(ExDivider, {
      props: { dashed: true, plain: true },
      slots: { default: '标题' },
    });
    expect(wrapper.classes()).toContain('ex-divider--dashed');
    expect(wrapper.classes()).toContain('ex-divider--plain');
  });

  it('仅在显式传入时设置可访问名称', () => {
    const wrapper = mount(ExDivider, {
      props: { ariaLabel: '内容章节分隔' },
    });
    expect(wrapper.attributes('aria-label')).toBe('内容章节分隔');
  });

  it('合并原生类名、样式和数据属性', () => {
    const wrapper = mount(ExDivider, {
      attrs: {
        class: 'custom-divider',
        style: { opacity: '0.8' },
        'data-testid': 'divider',
      },
    });
    expect(wrapper.classes()).toContain('custom-divider');
    expect(wrapper.attributes('style')).toContain('opacity: 0.8');
    expect(wrapper.attributes('data-testid')).toBe('divider');
  });
});
