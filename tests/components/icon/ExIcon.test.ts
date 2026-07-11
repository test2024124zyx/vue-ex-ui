import { Comment, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExIcon from '../../../src/components/icon/ExIcon.vue';

describe('ExIcon', () => {
  it('无来源时保持为空，不再伪造默认星形图标', () => {
    const wrapper = mount(ExIcon);

    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.classes()).toContain('ex-icon--empty');
    expect(wrapper.find('svg').exists()).toBe(false);
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('渲染冻结注册表中的内置 SVG，未知名称不回退到误导图形', () => {
    const known = mount(ExIcon, { props: { icon: 'search-line' } });
    const unknown = mount(ExIcon, { props: { icon: 'missing-icon' } });

    expect(known.find('svg circle').exists()).toBe(true);
    expect(known.find('.ex-icon__content').attributes('aria-hidden')).toBe('true');
    expect(unknown.find('.ex-icon__content').exists()).toBe(false);
    expect(unknown.classes()).toContain('ex-icon--empty');
  });

  it('真实插槽优先于其他来源，空插槽会继续使用内置图标', () => {
    const custom = mount(ExIcon, {
      props: { icon: 'search-line', src: '/fallback.png' },
      slots: { default: '<svg class="custom-svg"><path d="M0 0" /></svg>' },
    });
    const empty = mount(ExIcon, {
      props: { icon: 'check-line' },
      slots: { default: () => h(Comment) },
    });

    expect(custom.find('.custom-svg').exists()).toBe(true);
    expect(custom.find('img').exists()).toBe(false);
    expect(empty.find('svg path').attributes('d')).toBe('M5 12l5 5L20 7');
  });

  it('未知内置名称允许后续图片来源接管渲染', () => {
    const wrapper = mount(ExIcon, {
      props: { icon: 'missing-icon', src: '/fallback.png', alt: '备用图标' },
    });

    expect(wrapper.find('img').attributes('src')).toBe('/fallback.png');
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('备用图标');
  });

  it('字体图标会生成规范类名并拒绝异常类名片段', async () => {
    const wrapper = mount(ExIcon, { props: { name: 'star', prefix: 'fas' } });
    expect(wrapper.find('i').classes()).toEqual(['fas', 'fas-star']);

    await wrapper.setProps({ name: 'bad name' });
    expect(wrapper.find('i').exists()).toBe(false);
    expect(wrapper.classes()).toContain('ex-icon--empty');
  });

  it('图片由根元素统一提供可访问名称，内部图片不会重复朗读', () => {
    const wrapper = mount(ExIcon, {
      props: { src: '/logo.png', alt: '产品标志' },
    });
    const image = wrapper.find('img');

    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('产品标志');
    expect(image.attributes('alt')).toBe('');
    expect(image.attributes('aria-hidden')).toBe('true');
    expect(image.attributes('decoding')).toBe('async');
    expect(image.attributes('draggable')).toBe('false');
  });

  it('图片着色使用转义后的 mask URL，并保留可访问名称', () => {
    const wrapper = mount(ExIcon, {
      props: { src: '/icon.svg', color: '#f00', alt: '告警' },
    });
    const mask = wrapper.find('.ex-icon__image-mask');

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.attributes('aria-label')).toBe('告警');
    expect(mask.attributes('style')).toContain('--ex-icon-src: url("/icon.svg")');
  });

  it('尺寸和旋转通过独立变量作用，spin 不会覆盖基础旋转', async () => {
    const wrapper = mount(ExIcon, {
      props: { icon: 'refresh-line', size: 24, rotate: 450, spin: true },
    });

    expect(wrapper.attributes('style')).toContain('--ex-icon-size: 24px');
    expect(wrapper.attributes('style')).toContain('--ex-icon-rotation: 90deg');
    expect(wrapper.classes()).toContain('ex-icon--spin');
    expect(wrapper.find('.ex-icon__content').exists()).toBe(true);

    await wrapper.setProps({ size: -1, rotate: Number.NaN });
    expect(wrapper.attributes('style')).toContain('--ex-icon-size: 16px');
    expect(wrapper.attributes('style')).toContain('--ex-icon-rotation: 0deg');
  });

  it('同时合并原生 class 与兼容 customClass', () => {
    const wrapper = mount(ExIcon, {
      attrs: { class: 'native-class' },
      props: { icon: 'star-line', customClass: 'legacy-class' },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ex-icon', 'native-class', 'legacy-class'])
    );
  });

  it('clickable 使用 type=button 的原生按钮并发出真实 MouseEvent', async () => {
    const wrapper = mount(ExIcon, {
      props: { icon: 'search-line', clickable: true, ariaLabel: '搜索' },
    });

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.attributes('aria-label')).toBe('搜索');
    expect(wrapper.classes()).toContain('ex-icon--clickable');

    await wrapper.trigger('click');
    const event = wrapper.emitted('click')?.[0]?.[0];
    expect(event).toBeInstanceOf(MouseEvent);
  });

  it('clickable 缺少显式名称时使用图标名兜底，避免无名称按钮', () => {
    const wrapper = mount(ExIcon, {
      props: { icon: 'search-line', clickable: true },
    });

    expect(wrapper.attributes('aria-label')).toBe('search-line');
  });

  it('非交互图标不会伪发 click 事件', async () => {
    const wrapper = mount(ExIcon, { props: { icon: 'search-line' } });
    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('禁用交互图标使用原生 disabled 且不会发出点击', async () => {
    const wrapper = mount(ExIcon, {
      props: { icon: 'search-line', clickable: true, disabled: true, ariaLabel: '搜索' },
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('ex-icon--disabled');
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('允许调用方显式覆盖装饰性图标的 ARIA 属性', () => {
    const labelled = mount(ExIcon, {
      props: { icon: 'information-line', ariaLabel: '说明' },
    });
    const hidden = mount(ExIcon, {
      props: { icon: 'information-line', ariaLabel: '说明' },
      attrs: { 'aria-hidden': 'true' },
    });

    expect(labelled.attributes('role')).toBe('img');
    expect(labelled.attributes('aria-label')).toBe('说明');
    expect(labelled.attributes('aria-hidden')).toBeUndefined();
    expect(hidden.attributes('aria-hidden')).toBe('true');
  });
});
