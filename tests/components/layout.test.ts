import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExLayout from '../../src/components/layout/ExLayout.vue';
import ExHeader from '../../src/components/layout/ExHeader.vue';
import ExSider from '../../src/components/layout/ExSider.vue';
import ExContent from '../../src/components/layout/ExContent.vue';
import ExFooter from '../../src/components/layout/ExFooter.vue';

describe('ExLayout', () => {
  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExLayout, {
        slots: {
          default: '<div>Content</div>',
        },
      });

      expect(wrapper.find('.ex-layout').exists()).toBe(true);
      expect(wrapper.html()).toContain('Content');
    });

    it('应该应用正确的方向类名', () => {
      const wrapper = mount(ExLayout, {
        props: {
          direction: 'horizontal',
        },
      });

      expect(wrapper.find('.ex-layout--horizontal').exists()).toBe(true);
    });

    it('应该在有侧边栏时应用正确的类名', () => {
      const wrapper = mount(ExLayout, {
        props: {
          hasSider: true,
        },
      });

      expect(wrapper.find('.ex-layout--has-sider').exists()).toBe(true);
    });

    it('应该支持自定义类名', () => {
      const wrapper = mount(ExLayout, {
        props: {
          class: 'custom-class',
        },
      });

      expect(wrapper.find('.custom-class').exists()).toBe(true);
    });

    it('应该支持自定义样式', () => {
      const wrapper = mount(ExLayout, {
        props: {
          style: { backgroundColor: 'red' },
        },
      });

      expect(wrapper.attributes('style')).toContain('background-color: red');
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 getElement 方法', () => {
      const wrapper = mount(ExLayout);
      const vm = wrapper.vm as unknown as { getElement: () => HTMLElement | null };

      expect(typeof vm.getElement).toBe('function');
      expect(vm.getElement()).toBeTruthy();
    });
  });
});

describe('ExHeader', () => {
  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExHeader, {
        slots: {
          default: '<div>Header Content</div>',
        },
      });

      expect(wrapper.find('.ex-header').exists()).toBe(true);
      expect(wrapper.html()).toContain('Header Content');
    });

    it('应该支持左中右插槽', () => {
      const wrapper = mount(ExHeader, {
        slots: {
          left: '<div>Left</div>',
          center: '<div>Center</div>',
          right: '<div>Right</div>',
        },
      });

      expect(wrapper.find('.ex-header__left').exists()).toBe(true);
      expect(wrapper.find('.ex-header__center').exists()).toBe(true);
      expect(wrapper.find('.ex-header__right').exists()).toBe(true);
      expect(wrapper.html()).toContain('Left');
      expect(wrapper.html()).toContain('Center');
      expect(wrapper.html()).toContain('Right');
    });

    it('应该支持固定定位', () => {
      const wrapper = mount(ExHeader, {
        props: {
          fixed: true,
        },
      });

      expect(wrapper.find('.ex-header--fixed').exists()).toBe(true);
    });

    it('应该支持霓虹边框', () => {
      const wrapper = mount(ExHeader, {
        props: {
          neonBorder: true,
        },
      });

      expect(wrapper.find('.ex-header--neon-border').exists()).toBe(true);
    });

    it('应该支持背景模糊', () => {
      const wrapper = mount(ExHeader, {
        props: {
          blur: true,
        },
      });

      expect(wrapper.find('.ex-header--blur').exists()).toBe(true);
    });

    it('应该支持自定义高度', () => {
      const wrapper = mount(ExHeader, {
        props: {
          height: 80,
        },
      });

      expect(wrapper.attributes('style')).toContain('height: 80px');
    });
  });

  describe('无障碍', () => {
    it('应该有正确的 role 属性', () => {
      const wrapper = mount(ExHeader);
      expect(wrapper.attributes('role')).toBe('banner');
    });
  });
});

describe('ExSider', () => {
  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExSider, {
        slots: {
          default: '<div>Sider Content</div>',
        },
      });

      expect(wrapper.find('.ex-sider').exists()).toBe(true);
      expect(wrapper.html()).toContain('Sider Content');
    });

    it('应该支持左右位置', () => {
      const wrapperLeft = mount(ExSider, {
        props: {
          position: 'left',
        },
      });

      const wrapperRight = mount(ExSider, {
        props: {
          position: 'right',
        },
      });

      expect(wrapperLeft.find('.ex-sider--left').exists()).toBe(true);
      expect(wrapperRight.find('.ex-sider--right').exists()).toBe(true);
    });

    it('应该支持收起状态', () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsed: true,
        },
      });

      expect(wrapper.find('.ex-sider--collapsed').exists()).toBe(true);
    });

    it('应该支持自定义宽度', () => {
      const wrapper = mount(ExSider, {
        props: {
          width: 300,
        },
      });

      const aside = wrapper.find('aside');
      const style = aside.attributes('style');
      expect(style).toBeDefined();
      expect(style).toMatch(/width:\s*300px/);
    });

    it('应该在收起时使用收起宽度', async () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsed: true,
          collapsedWidth: 60,
        },
      });

      await wrapper.vm.$nextTick();
      const aside = wrapper.find('aside');
      const style = aside.attributes('style');
      expect(style).toBeDefined();
      expect(style).toMatch(/width:\s*60px/);
    });
  });

  describe('可收起功能', () => {
    it('应该显示触发器', () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsible: true,
        },
      });

      expect(wrapper.find('.ex-sider__trigger').exists()).toBe(true);
    });

    it('应该在点击触发器时切换状态', async () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsible: true,
          collapsed: false,
        },
      });

      await wrapper.find('.ex-sider__trigger').trigger('click');

      expect(wrapper.emitted('update:collapsed')).toBeTruthy();
      expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true]);
      expect(wrapper.emitted('collapse')).toBeTruthy();
    });

    it('应该支持键盘操作', async () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsible: true,
        },
      });

      const trigger = wrapper.find('.ex-sider__trigger');
      await trigger.trigger('keydown.enter');

      expect(wrapper.emitted('update:collapsed')).toBeTruthy();
    });

    it('应该有正确的 ARIA 属性', () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsible: true,
        },
      });

      const trigger = wrapper.find('.ex-sider__trigger');
      expect(trigger.attributes('role')).toBe('button');
      expect(trigger.attributes('tabindex')).toBe('0');
      expect(trigger.attributes('aria-label')).toBeTruthy();
    });
  });

  describe('暴露的方法', () => {
    it('应该暴露 toggle 方法', () => {
      const wrapper = mount(ExSider, {
        props: {
          collapsible: true,
        },
      });
      const vm = wrapper.vm as unknown as { toggle: () => void };

      expect(typeof vm.toggle).toBe('function');
      vm.toggle();

      expect(wrapper.emitted('update:collapsed')).toBeTruthy();
    });
  });
});

describe('ExContent', () => {
  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExContent, {
        slots: {
          default: '<div>Content</div>',
        },
      });

      expect(wrapper.find('.ex-content').exists()).toBe(true);
      expect(wrapper.html()).toContain('Content');
    });

    it('应该支持网格背景', () => {
      const wrapper = mount(ExContent, {
        props: {
          grid: true,
        },
      });

      expect(wrapper.find('.ex-content--grid').exists()).toBe(true);
      expect(wrapper.find('.ex-content__grid').exists()).toBe(true);
    });

    it('应该支持扫描线效果', () => {
      const wrapper = mount(ExContent, {
        props: {
          scanline: true,
        },
      });

      expect(wrapper.find('.ex-content--scanline').exists()).toBe(true);
      expect(wrapper.find('.ex-content__scanline').exists()).toBe(true);
    });
  });

  describe('无障碍', () => {
    it('应该有正确的 role 属性', () => {
      const wrapper = mount(ExContent);
      expect(wrapper.attributes('role')).toBe('main');
    });
  });
});

describe('ExFooter', () => {
  describe('基础功能', () => {
    it('应该正确渲染', () => {
      const wrapper = mount(ExFooter, {
        slots: {
          default: '<div>Footer Content</div>',
        },
      });

      expect(wrapper.find('.ex-footer').exists()).toBe(true);
      expect(wrapper.html()).toContain('Footer Content');
    });

    it('应该支持左中右插槽', () => {
      const wrapper = mount(ExFooter, {
        slots: {
          left: '<div>Left</div>',
          center: '<div>Center</div>',
          right: '<div>Right</div>',
        },
      });

      expect(wrapper.find('.ex-footer__left').exists()).toBe(true);
      expect(wrapper.find('.ex-footer__center').exists()).toBe(true);
      expect(wrapper.find('.ex-footer__right').exists()).toBe(true);
    });

    it('应该支持固定定位', () => {
      const wrapper = mount(ExFooter, {
        props: {
          fixed: true,
        },
      });

      expect(wrapper.find('.ex-footer--fixed').exists()).toBe(true);
    });

    it('应该支持霓虹边框', () => {
      const wrapper = mount(ExFooter, {
        props: {
          neonBorder: true,
        },
      });

      expect(wrapper.find('.ex-footer--neon-border').exists()).toBe(true);
    });

    it('应该支持自定义高度', () => {
      const wrapper = mount(ExFooter, {
        props: {
          height: 80,
        },
      });

      expect(wrapper.attributes('style')).toContain('height: 80px');
    });
  });

  describe('无障碍', () => {
    it('应该有正确的 role 属性', () => {
      const wrapper = mount(ExFooter);
      expect(wrapper.attributes('role')).toBe('contentinfo');
    });
  });
});
