import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExImage from '../../../src/components/image/ExImage.vue';
import { setLocale } from '../../../src/locale';
import type { ExImageProps } from '../../../src/components/image/types';

describe('ExImage', () => {
  const wrappers: VueWrapper[] = [];
  const hosts: HTMLElement[] = [];

  const mountImage = (
    props: Partial<ExImageProps> = {},
    slots: Record<string, string> = {},
    attrs: Record<string, unknown> = {}
  ) => {
    const host = document.createElement('div');
    document.body.append(host);
    hosts.push(host);
    const wrapper = mount(ExImage, {
      attachTo: host,
      props: {
        src: '/image.png',
        alt: '示例图片',
        ...props,
      },
      slots,
      attrs,
    });
    wrappers.push(wrapper);
    return wrapper;
  };

  beforeEach(() => {
    setLocale('en-US');
  });

  afterEach(() => {
    // 浮层会修改 body 滚动状态，卸载组件后再清理挂载节点。
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    hosts.splice(0).forEach(host => host.remove());
    document.querySelectorAll('.ex-image-preview').forEach(node => node.remove());
    vi.restoreAllMocks();
  });

  it('只由原生图片提供图像语义，不重复创建 role=img', () => {
    const wrapper = mountImage();
    const image = wrapper.find('img');

    expect(wrapper.attributes('role')).toBeUndefined();
    expect(image.attributes('src')).toBe('/image.png');
    expect(image.attributes('alt')).toBe('示例图片');
    expect(image.attributes('title')).toBeUndefined();
    expect(image.attributes('loading')).toBe('lazy');
    expect(image.attributes('decoding')).toBe('async');
  });

  it('只在显式传入 title 时创建原生提示，并支持 eager 加载', () => {
    const wrapper = mountImage({ title: '查看原图', lazy: false });
    const image = wrapper.find('img');

    expect(image.attributes('title')).toBe('查看原图');
    expect(image.attributes('loading')).toBe('eager');
    expect(image.attributes('decoding')).toBe('async');
  });

  it('规范宽高和圆角，同时可靠合并根 class/style attrs', () => {
    const wrapper = mountImage(
      { width: '300', height: 200, radius: 12 },
      {},
      { class: 'gallery-image', style: { opacity: '0.8' }, 'data-id': 'cover' }
    );

    expect(wrapper.classes()).toContain('gallery-image');
    expect(wrapper.attributes('data-id')).toBe('cover');
    expect(wrapper.attributes('style')).toContain('width: 300px');
    expect(wrapper.attributes('style')).toContain('height: 200px');
    expect(wrapper.attributes('style')).toContain('border-radius: 12px');
    expect(wrapper.attributes('style')).toContain('opacity: 0.8');
  });

  it('加载期间暴露 busy/status 语义并支持自定义占位', () => {
    const custom = mountImage({}, { placeholder: '<span class="custom-loading">加载中</span>' });
    expect(custom.attributes('aria-busy')).toBe('true');
    expect(custom.find('.ex-image__placeholder').attributes('role')).toBe('status');
    expect(custom.find('.ex-image__placeholder').attributes('aria-label')).toBe('Loading...');
    expect(custom.find('.custom-loading').exists()).toBe(true);
    expect(custom.find('.ex-image__spinner').exists()).toBe(false);

    const fallback = mountImage();
    expect(fallback.find('.ex-image__spinner').exists()).toBe(true);
  });

  it('加载成功后清除占位、发出事件并显示装饰插槽', async () => {
    const wrapper = mountImage({}, { default: '<span class="caption">说明</span>' });
    await wrapper.find('img').trigger('load');

    expect(wrapper.emitted('load')?.[0]?.[0]).toBeInstanceOf(Event);
    expect(wrapper.attributes('aria-busy')).toBeUndefined();
    expect(wrapper.find('.ex-image__placeholder').exists()).toBe(false);
    expect(wrapper.find('.caption').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-image--loaded');
  });

  it('挂载时会补偿已经完成加载的缓存图片，避免永久停留在加载态', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(80);

    const wrapper = mountImage();
    await nextTick();
    await nextTick();

    expect(wrapper.find('.ex-image__placeholder').exists()).toBe(false);
    expect(wrapper.classes()).toContain('ex-image--loaded');
    expect(wrapper.emitted('load')?.[0]?.[0]).toBeInstanceOf(Event);
  });

  it('挂载时会识别已经加载失败的缓存图片并进入错误态', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);

    const wrapper = mountImage();
    await nextTick();
    await nextTick();

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.ex-image__error').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-image--error');
    expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(Event);
  });

  it('加载失败后发出事件、移除破损图片，并提供稳定错误区域', async () => {
    const wrapper = mountImage({}, { error: '<strong class="custom-error">加载失败</strong>' });
    await wrapper.find('img').trigger('error');

    expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(Event);
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.custom-error').exists()).toBe(true);
    expect(wrapper.find('.ex-image__error').attributes('role')).toBe('alert');
    expect(wrapper.find('.ex-image__error').attributes('aria-label')).toBeUndefined();
    expect(wrapper.classes()).toContain('ex-image--error');
  });

  it('src 更新会替换原生图片，旧节点的迟到事件不能污染新状态', async () => {
    const wrapper = mountImage({ src: '/first.png' });
    const staleImage = wrapper.find('img').element;

    await wrapper.setProps({ src: '/second.png' });
    expect(wrapper.find('img').element).not.toBe(staleImage);
    expect(wrapper.find('img').attributes('src')).toBe('/second.png');

    staleImage.dispatchEvent(new Event('load'));
    await nextTick();
    expect(wrapper.find('.ex-image__placeholder').exists()).toBe(true);
    expect(wrapper.emitted('load')).toBeUndefined();
  });

  it('空 src 进入 idle 状态且不显示图片、加载或错误内容', async () => {
    const wrapper = mountImage();
    await wrapper.setProps({ src: '' });

    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.find('.ex-image__placeholder').exists()).toBe(false);
    expect(wrapper.find('.ex-image__error').exists()).toBe(false);
    expect(wrapper.classes()).toContain('ex-image--idle');
  });

  it('fit 通过受控 CSS 变量真实作用于图片', () => {
    const wrapper = mountImage({ fit: 'contain' });
    expect(wrapper.attributes('style')).toContain('--ex-image-fit: contain');
  });

  it('预览触发器是原生按钮，主图成功前保持禁用', async () => {
    const wrapper = mountImage({ preview: true });
    const trigger = wrapper.find<HTMLButtonElement>('.ex-image__preview-trigger');

    expect(trigger.element.tagName).toBe('BUTTON');
    expect(trigger.attributes('type')).toBe('button');
    expect(trigger.attributes('disabled')).toBeDefined();
    expect(trigger.attributes('aria-label')).toBe('Preview 示例图片');

    await wrapper.find('img').trigger('load');
    expect(trigger.attributes('disabled')).toBeUndefined();
    expect(wrapper.classes()).toContain('ex-image--preview-ready');
  });

  it('打开高清预览会发出事件、锁定滚动，并可通过 Escape 关闭', async () => {
    const wrapper = mountImage({ preview: true, previewSrc: '/full.png' });
    await wrapper.find('img').trigger('load');
    const trigger = wrapper.find<HTMLButtonElement>('.ex-image__preview-trigger');
    trigger.element.focus();
    await trigger.trigger('click');
    await nextTick();

    const dialog = document.body.querySelector<HTMLElement>('.ex-image-preview');
    expect(wrapper.emitted('preview')).toHaveLength(1);
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-label')).toBe('Preview: 示例图片');
    expect(dialog?.querySelector('img')?.getAttribute('src')).toBe('/full.png');
    expect(document.body.style.overflow).toBe('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('.ex-image-preview')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('点击预览遮罩或关闭按钮均可关闭，并恢复触发器焦点', async () => {
    const wrapper = mountImage({ preview: true });
    await wrapper.find('img').trigger('load');
    const trigger = wrapper.find<HTMLButtonElement>('.ex-image__preview-trigger');
    trigger.element.focus();
    await trigger.trigger('click');
    await nextTick();

    const overlay = document.body.querySelector<HTMLElement>('.ex-image-preview');
    overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('.ex-image-preview')).toBeNull();
    expect(document.activeElement).toBe(trigger.element);

    await trigger.trigger('click');
    await nextTick();
    const close = document.body.querySelector<HTMLButtonElement>('.ex-image-preview__close');
    close?.click();
    await nextTick();
    expect(document.body.querySelector('.ex-image-preview')).toBeNull();
  });

  it('预览源加载失败时显示独立错误状态', async () => {
    const wrapper = mountImage({ preview: true, previewSrc: '/broken-full.png' });
    await wrapper.find('img').trigger('load');
    await wrapper.find('.ex-image__preview-trigger').trigger('click');
    await nextTick();

    const previewImage = document.body.querySelector<HTMLImageElement>('.ex-image-preview__img');
    previewImage?.dispatchEvent(new Event('error'));
    await nextTick();

    expect(document.body.querySelector('.ex-image-preview__img')).toBeNull();
    expect(document.body.querySelector('.ex-image-preview__error')?.getAttribute('role')).toBe(
      'alert'
    );
  });

  it('预览源加载成功后清除 busy，地址变化时重新进入加载状态', async () => {
    const wrapper = mountImage({ preview: true, previewSrc: '/full-1.png' });
    await wrapper.find('img').trigger('load');
    await wrapper.find('.ex-image__preview-trigger').trigger('click');
    await nextTick();

    const firstPreview = document.body.querySelector<HTMLImageElement>('.ex-image-preview__img');
    firstPreview?.dispatchEvent(new Event('load'));
    await nextTick();
    expect(document.body.querySelector('.ex-image-preview')?.getAttribute('aria-busy')).toBeNull();
    expect(document.body.querySelector('.ex-image-preview__loading')).toBeNull();

    await wrapper.setProps({ previewSrc: '/full-2.png' });
    expect(document.body.querySelector('.ex-image-preview')?.getAttribute('aria-busy')).toBe(
      'true'
    );
    expect(document.body.querySelector('.ex-image-preview__img')?.getAttribute('src')).toBe(
      '/full-2.png'
    );
  });

  it('主图地址或 preview 开关变化会关闭已打开的预览', async () => {
    const wrapper = mountImage({ preview: true });
    await wrapper.find('img').trigger('load');
    await wrapper.find('.ex-image__preview-trigger').trigger('click');
    expect(document.body.querySelector('.ex-image-preview')).not.toBeNull();

    await wrapper.setProps({ src: '/next.png' });
    expect(document.body.querySelector('.ex-image-preview')).toBeNull();

    await wrapper.find('img').trigger('load');
    await wrapper.find('.ex-image__preview-trigger').trigger('click');
    await wrapper.setProps({ preview: false });
    expect(document.body.querySelector('.ex-image-preview')).toBeNull();
  });

  it('暴露真实根元素', () => {
    const wrapper = mountImage();
    const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };
    expect(exposed.getElement()).toBe(wrapper.find('.ex-image').element);
  });
});
