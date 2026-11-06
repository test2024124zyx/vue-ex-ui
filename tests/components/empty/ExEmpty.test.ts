import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Comment, h } from 'vue';
import { mount, type ComponentMountingOptions, type VueWrapper } from '@vue/test-utils';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExEmpty from '../../../src/components/empty/ExEmpty.vue';
import type { ExEmptyPresetSize, ExEmptyType } from '../../../src/components/empty/types';
import { setLocale } from '../../../src/locale';

describe('ExEmpty', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    setLocale('en-US');
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    setLocale('en-US');
  });

  /** 统一挂载入口保证每个用例都会清理组件实例。 */
  const mountEmpty = (options: ComponentMountingOptions<typeof ExEmpty> = {}) => {
    wrapper = mount(ExEmpty, options);
    return wrapper;
  };

  it('默认渲染中尺寸装饰图，并以状态区域播报本地化描述', () => {
    const empty = mountEmpty();

    expect(empty.classes()).toContain('ex-empty--medium');
    expect(empty.get('.ex-empty__svg').attributes('aria-hidden')).toBe('true');
    expect(empty.get('.ex-empty__svg').attributes('focusable')).toBe('false');
    expect(empty.get('.ex-empty__description').text()).toBe('No Data');
    expect(empty.get('.ex-empty__description').attributes('role')).toBe('status');
    expect(empty.get('.ex-empty__description').attributes('aria-live')).toBe('polite');
  });

  it.each<[ExEmptyType, string]>([
    ['default', 'No Data'],
    ['no-data', 'No Data'],
    ['no-result', 'No Results Found'],
    ['error', 'Something Went Wrong'],
    ['network-error', 'Network Error, Please Retry'],
  ])('type=%s 选择真实存在的默认描述', (type, expected) => {
    expect(mountEmpty({ props: { type } }).get('.ex-empty__description').text()).toBe(expected);
  });

  it('非法运行时 type 回退到 default，而不是暴露翻译键或空文本', () => {
    const invalidType = 'permission' as ExEmptyType;
    expect(
      mountEmpty({ props: { type: invalidType } })
        .get('.ex-empty__description')
        .text()
    ).toBe('No Data');
  });

  it('遵循 ConfigProvider 子树语言，不受全局语言污染', () => {
    wrapper = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: { default: () => h(ExEmpty, { type: 'network-error' }) },
    });

    expect(wrapper.get('.ex-empty__description').text()).toBe('网络异常，请稍后重试');
  });

  it('显式空描述会关闭默认文案和冗余状态节点', () => {
    const empty = mountEmpty({ props: { description: '' } });
    expect(empty.find('.ex-empty__description').exists()).toBe(false);
  });

  it('有效描述插槽覆盖 description，无效插槽仍回退到属性文本', () => {
    const custom = mountEmpty({
      props: { description: '属性描述' },
      slots: { description: '<span class="custom-description">插槽描述</span>' },
    });
    expect(custom.get('.custom-description').text()).toBe('插槽描述');

    custom.unmount();
    wrapper = null;
    const fallback = mountEmpty({
      props: { description: '属性描述' },
      slots: { description: () => [' ', h(Comment)] },
    });
    expect(fallback.get('.ex-empty__description').text()).toBe('属性描述');
  });

  it('showImage=false 隐藏默认图、图片属性和图片插槽的整个布局区域', () => {
    const empty = mountEmpty({
      props: { showImage: false, image: '/empty.png' },
      slots: { image: '<span class="custom-image">图片</span>' },
    });

    expect(empty.find('.ex-empty__image').exists()).toBe(false);
    expect(empty.find('.custom-image').exists()).toBe(false);
  });

  it('有效图片插槽覆盖图片属性，空图片插槽回退到属性图片', () => {
    const custom = mountEmpty({
      props: { image: '/empty.png' },
      slots: { image: '<span class="custom-image">自定义图片</span>' },
    });
    expect(custom.find('img').exists()).toBe(false);
    expect(custom.get('.custom-image').text()).toBe('自定义图片');

    custom.unmount();
    wrapper = null;
    const fallback = mountEmpty({
      props: { image: '/empty.png' },
      slots: { image: () => [' ', h(Comment)] },
    });
    expect(fallback.get('img').attributes('src')).toBe('/empty.png');
  });

  it('空白图片地址不发起无意义请求并回退到默认图', () => {
    const empty = mountEmpty({ props: { image: '   ' } });
    expect(empty.find('img').exists()).toBe(false);
    expect(empty.find('.ex-empty__svg').exists()).toBe(true);
  });

  it('外部图片默认作为装饰；显式 imageAlt 才赋予可访问名称', async () => {
    const empty = mountEmpty({ props: { image: ' /empty.png ' } });
    expect(empty.get('img').attributes('src')).toBe('/empty.png');
    expect(empty.get('img').attributes('alt')).toBe('');
    expect(empty.get('img').attributes('aria-hidden')).toBe('true');

    await empty.setProps({ imageAlt: '空购物车插图' });
    expect(empty.get('img').attributes('alt')).toBe('空购物车插图');
    expect(empty.get('img').attributes('aria-hidden')).toBeUndefined();
  });

  it('外部图片加载失败时发出原始错误事件并回退到默认图', async () => {
    const empty = mountEmpty({ props: { image: '/broken.png' } });
    await empty.get('img').trigger('error');

    const events = empty.emitted('image-error');
    expect(events).toHaveLength(1);
    expect(events?.[0]?.[0]).toBeInstanceOf(Event);
    expect(empty.find('img').exists()).toBe(false);
    expect(empty.find('.ex-empty__svg').exists()).toBe(true);
  });

  it('图片地址变化会清除上一地址的失败状态', async () => {
    const empty = mountEmpty({ props: { image: '/broken.png' } });
    await empty.get('img').trigger('error');
    await empty.setProps({ image: '/available.png' });

    expect(empty.get('img').attributes('src')).toBe('/available.png');
    expect(empty.find('.ex-empty__svg').exists()).toBe(false);
  });

  it.each<ExEmptyPresetSize>(['small', 'medium', 'large'])('应用 %s 预设图片尺寸', size => {
    const empty = mountEmpty({ props: { imageSize: size } });
    expect(empty.classes()).toContain(`ex-empty--${size}`);
    expect(empty.attributes('style')).toBeUndefined();
  });

  it('正数自定义尺寸通过稳定 CSS 变量生效', () => {
    const empty = mountEmpty({ props: { imageSize: 96.5 } });
    expect(empty.classes()).toContain('ex-empty--custom');
    expect(empty.attributes('style')).toContain('--ex-empty-image-size: 96.5px');
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    '非法数字尺寸 %s 回退到 medium',
    imageSize => {
      const empty = mountEmpty({ props: { imageSize } });
      expect(empty.classes()).toContain('ex-empty--medium');
      expect(empty.classes()).not.toContain('ex-empty--custom');
      expect(empty.attributes('style')).toBeUndefined();
    }
  );

  it('非法运行时字符串尺寸回退到 medium', () => {
    const invalidSize = 'huge' as ExEmptyPresetSize;
    const empty = mountEmpty({ props: { imageSize: invalidSize } });
    expect(empty.classes()).toContain('ex-empty--medium');
    expect(empty.classes()).not.toContain('ex-empty--huge');
  });

  it('仅为有效默认插槽创建操作区域', () => {
    const empty = mountEmpty({ slots: { default: () => [' ', h(Comment)] } });
    expect(empty.find('.ex-empty__footer').exists()).toBe(false);

    empty.unmount();
    wrapper = null;
    const withAction = mountEmpty({
      slots: { default: '<button class="refresh">刷新</button>' },
    });
    expect(withAction.get('.ex-empty__footer .refresh').text()).toBe('刷新');
  });

  it('合并原生 class、style、状态名称和 data 属性', () => {
    const empty = mountEmpty({
      attrs: {
        class: 'custom-empty',
        style: { minHeight: '40px' },
        'aria-label': '空列表',
        'data-testid': 'empty',
      },
    });

    expect(empty.classes()).toContain('custom-empty');
    expect(empty.attributes('style')).toContain('min-height: 40px');
    expect(empty.attributes('aria-label')).toBe('空列表');
    expect(empty.attributes('data-testid')).toBe('empty');
  });
});
