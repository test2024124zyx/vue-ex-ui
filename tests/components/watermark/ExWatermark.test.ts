import { describe, it, expect, beforeAll, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExWatermark from '@/components/watermark/ExWatermark.vue';
import { nextTick } from 'vue';

// Mock canvas context for jsdom
beforeAll(() => {
  // Mock Canvas API
  HTMLCanvasElement.prototype.getContext = function () {
    return {
      scale: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      restore: vi.fn(),
    } as any;
  };
  HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,EX';
  
  // Mock devicePixelRatio
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: 2,
  });
});

// 等待异步操作完成的辅助函数
const waitAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

describe('ExWatermark', () => {
  it('渲染文本水印并生成 dataURL', async () => {
    const wrapper = mount(ExWatermark, {
      props: { type: 'text', text: 'TEST', gapX: 100, gapY: 80, fullPage: false },
    });
    
    await waitAsync(); // 等待 onMounted 中的异步操作
    
    const overlay = wrapper.find('.ex-watermark__overlay');
    expect(overlay.exists()).toBe(true);
    const style = overlay.attributes('style');
    expect(style).toContain('background-image: url("data:image/png;base64,EX")');
  });

  it('全屏模式使用 fixed 定位', async () => {
    const wrapper = mount(ExWatermark, { props: { fullPage: true } });
    await nextTick();
    const overlay = wrapper.get('.ex-watermark__overlay');
    expect(overlay.classes()).toContain('is-fixed');
  });

  it('容器模式在根元素使用 relative 定位', async () => {
    const wrapper = mount(ExWatermark, { props: { fullPage: false } });
    await nextTick();
    const root = wrapper.get('.ex-watermark');
    expect(root.attributes('style')).toContain('position: relative');
  });

  it('暴露 refresh 和 toDataURL 方法', async () => {
    const wrapper = mount(ExWatermark);
    
    await waitAsync(); // 等待 onMounted 中的异步操作

    const vm = wrapper.vm as any;

    expect(vm.refresh).toBeInstanceOf(Function);
    expect(vm.toDataURL).toBeInstanceOf(Function);
    expect(vm.toDataURL()).toContain('data:image/png;base64,EX');
  });

  it('支持自定义样式属性', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        opacity: 0.5,
        zIndex: 1000,
        pointerEvents: 'auto',
        selectable: true,
      },
    });
    
    await waitAsync();
    
    const overlay = wrapper.find('.ex-watermark__overlay');
    const style = overlay.attributes('style');
    expect(style).toContain('opacity: 0.5');
    expect(style).toContain('--wm-z-index: 1000');
    expect(style).toContain('--wm-pointer-events: auto');
    expect(style).toContain('--wm-user-select: text');
  });

  it('支持布局控制属性', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        gapX: 150,
        gapY: 100,
        offsetX: 20,
        offsetY: 10,
        repeat: false,
      },
    });
    
    await waitAsync();
    
    const overlay = wrapper.find('.ex-watermark__overlay');
    const style = overlay.attributes('style');
    expect(style).toContain('background-size: 150px 100px');
    expect(style).toContain('background-position: 20px 10px');
    expect(style).toContain('background-repeat: no-repeat');
  });

  it('包含无障碍属性', async () => {
    const wrapper = mount(ExWatermark, {
      props: { text: '测试水印' },
    });

    await waitAsync();

    const root = wrapper.get('.ex-watermark');
    expect(root.attributes('role')).toBe('presentation');
    expect(root.attributes('aria-hidden')).toBe('true');
    expect(root.attributes('aria-label')).toBe('测试水印');
  });

  it('支持防篡改保护配置', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        antiTamper: true,
        text: '受保护的水印',
      },
    });

    await waitAsync();

    // 验证组件正常渲染
    const overlay = wrapper.find('.ex-watermark__overlay');
    expect(overlay.exists()).toBe(true);

    // 注意：在测试环境中 MutationObserver 的行为可能有限
    // 这里主要验证配置不会导致错误
    expect(wrapper.vm).toBeDefined();
  });

  it('防篡改功能不影响正常渲染', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        antiTamper: false,
        text: '普通水印',
      },
    });

    await waitAsync();

    const overlay = wrapper.find('.ex-watermark__overlay');
    expect(overlay.exists()).toBe(true);
  });

  it('支持单行文本', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        text: '单行水印',
        fullPage: false,
      },
    });

    await waitAsync();

    const overlay = wrapper.find('.ex-watermark__overlay');
    expect(overlay.exists()).toBe(true);
    const style = overlay.attributes('style');
    expect(style).toContain('background-image: url("data:image/png;base64,EX")');
  });

  it('支持多行文本（数组）', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        text: ['第一行', '第二行', '第三行'],
        lineHeight: 22,
        fullPage: false,
      },
    });

    await waitAsync();

    const overlay = wrapper.find('.ex-watermark__overlay');
    expect(overlay.exists()).toBe(true);
    const style = overlay.attributes('style');
    expect(style).toContain('background-image: url("data:image/png;base64,EX")');
  });

  it('多行文本支持自定义行间距', async () => {
    const wrapper = mount(ExWatermark, {
      props: {
        text: ['行1', '行2'],
        lineHeight: 30,
        fontSize: 16,
      },
    });

    await waitAsync();

    const overlay = wrapper.find('.ex-watermark__overlay');
    expect(overlay.exists()).toBe(true);
  });
});