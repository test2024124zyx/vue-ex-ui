import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExProgress from '../../../src/components/progress/ExProgress.vue';

describe('ExProgress', () => {
  describe('组件渲染', () => {
    it('应该正确渲染进度条', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
        },
      });

      expect(wrapper.find('.ex-progress').exists()).toBe(true);
      expect(wrapper.find('.ex-progress__bar').exists()).toBe(true);
    });

    it('应该显示进度文字', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          showText: true,
        },
      });

      expect(wrapper.find('.ex-progress__text-outside').text()).toBe('50%');
    });

    it('应该隐藏进度文字', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          showText: false,
        },
      });

      expect(wrapper.find('.ex-progress__text-outside').exists()).toBe(false);
    });

    it('应该在内部显示进度文字', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          textInside: true,
        },
      });

      expect(wrapper.find('.ex-progress__text-inside').exists()).toBe(true);
      expect(wrapper.find('.ex-progress__text-inside').text()).toBe('50%');
    });

    it('应该显示状态图标', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 100,
          status: 'success',
          showIcon: true,
        },
      });

      expect(wrapper.find('.ex-progress__icon').exists()).toBe(true);
    });

    it('应该显示条纹', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          striped: true,
        },
      });

      expect(wrapper.find('.ex-progress__stripes').exists()).toBe(true);
    });

    it('应该显示流动条纹', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          striped: true,
          stripedFlow: true,
        },
      });

      expect(wrapper.find('.ex-progress__stripes--animated').exists()).toBe(true);
    });
  });

  describe('进度条类型', () => {
    it('应该渲染线性进度条', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          type: 'line',
        },
      });

      expect(wrapper.find('.ex-progress--line').exists()).toBe(true);
    });
  });

  describe('进度条状态', () => {
    it.each([
      ['success', 'ex-progress--success'],
      ['exception', 'ex-progress--exception'],
      ['warning', 'ex-progress--warning'],
    ])('应该正确应用 %s 状态样式', (status, className) => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          status: status as any,
        },
      });

      expect(wrapper.find('.ex-progress').classes()).toContain(className);
    });
  });

  describe('进度百分比', () => {
    it('应该正确显示百分比', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 75,
        },
      });

      const bar = wrapper.find('.ex-progress__bar');
      expect(bar.attributes('style')).toContain('width: 75%');
    });

    it('应该限制百分比在 0-100 之间', () => {
      const wrapper1 = mount(ExProgress, {
        props: {
          percentage: -10,
        },
      });

      const bar1 = wrapper1.find('.ex-progress__bar');
      expect(bar1.attributes('style')).toContain('width: 0%');

      const wrapper2 = mount(ExProgress, {
        props: {
          percentage: 150,
        },
      });

      const bar2 = wrapper2.find('.ex-progress__bar');
      expect(bar2.attributes('style')).toContain('width: 100%');
    });
  });

  describe('自定义颜色', () => {
    it('应该应用字符串颜色', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          color: '#ff0000',
        },
      });

      const bar = wrapper.find('.ex-progress__bar');
      expect(bar.attributes('style')).toContain('background: rgb(255, 0, 0)');
    });

    it('应该应用函数颜色', () => {
      const colorFunc = (percentage: number) => {
        return percentage < 50 ? '#ff0000' : '#00ff00';
      };

      const wrapper = mount(ExProgress, {
        props: {
          percentage: 75,
          color: colorFunc,
        },
      });

      const bar = wrapper.find('.ex-progress__bar');
      expect(bar.attributes('style')).toContain('background: rgb(0, 255, 0)');
    });

    it('应该应用渐变颜色', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          color: [
            { color: '#ff0000', percentage: 0 },
            { color: '#00ff00', percentage: 100 },
          ],
        },
      });

      const bar = wrapper.find('.ex-progress__bar');
      expect(bar.attributes('style')).toContain('linear-gradient');
    });
  });

  describe('自定义格式化', () => {
    it('应该使用自定义格式化函数', () => {
      const format = (percentage: number) => `${percentage} / 100`;

      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          format,
        },
      });

      expect(wrapper.find('.ex-progress__text-outside').text()).toBe('50 / 100');
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义类名', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          class: 'custom-progress',
        },
      });

      expect(wrapper.find('.ex-progress').classes()).toContain('custom-progress');
    });

    it('应该应用自定义线宽', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          strokeWidth: 12,
        },
      });

      const bar = wrapper.find('.ex-progress__bar');
      expect(bar.attributes('style')).toContain('height: 12px');
    });
  });

  describe('无障碍支持', () => {
    it('应该有正确的 ARIA 属性', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
          ariaLabel: '下载进度',
        },
      });

      const progress = wrapper.find('.ex-progress');
      expect(progress.attributes('role')).toBe('progressbar');
      expect(progress.attributes('aria-valuenow')).toBe('50');
      expect(progress.attributes('aria-valuemin')).toBe('0');
      expect(progress.attributes('aria-valuemax')).toBe('100');
      expect(progress.attributes('aria-label')).toBe('下载进度');
    });
  });

  describe('插槽', () => {
    it('应该支持自定义文字插槽', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
        },
        slots: {
          text: '自定义文字',
        },
      });

      expect(wrapper.find('.ex-progress__text-outside').text()).toBe('自定义文字');
    });

    it('应该支持自定义图标插槽', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 100,
          status: 'success',
        },
        slots: {
          icon: '<span class="custom-icon">✓</span>',
        },
      });

      expect(wrapper.find('.ex-progress__icon').html()).toContain('custom-icon');
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 getElement 方法', () => {
      const wrapper = mount(ExProgress, {
        props: {
          percentage: 50,
        },
      });

      const exposed = wrapper.vm as any;
      expect(exposed.getElement).toBeDefined();
      expect(exposed.getElement()).toBeInstanceOf(HTMLElement);
    });
  });
});
