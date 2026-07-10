import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExFilePreview from '../../../src/components/file-preview/ExFilePreview.vue';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('ExFilePreview', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  describe('文件类型检测', () => {
    it('根据扩展名识别图片', async () => {
      mount(ExFilePreview, {
        props: { visible: true, file: 'photo.png' },
        attachTo: document.body,
      });
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')).toBeTruthy();
    });

    it('根据 mimeType 识别视频', async () => {
      mount(ExFilePreview, {
        props: { visible: true, file: { url: 'clip', mimeType: 'video/mp4' } },
        attachTo: document.body,
      });
      await nextTick();
      expect(document.querySelector('.ex-file-preview__video')).toBeTruthy();
    });

    it('未知类型显示不支持提示', async () => {
      mount(ExFilePreview, {
        props: { visible: true, file: 'archive.xyz' },
        attachTo: document.body,
      });
      await nextTick();
      expect(document.querySelector('.ex-file-preview__unsupported')).toBeTruthy();
    });
  });

  describe('多文件切换', () => {
    it('prev()/next() 切换当前文件', async () => {
      const wrapper = mount(ExFilePreview, {
        props: { visible: true, files: ['a.png', 'b.png', 'c.png'], initialIndex: 1 },
        attachTo: document.body,
      });
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('b.png');

      (wrapper.vm as any).next();
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('c.png');

      (wrapper.vm as any).prev();
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('b.png');
    });

    it('ArrowLeft / ArrowRight 键盘切换', async () => {
      mount(ExFilePreview, {
        props: { visible: true, files: ['a.png', 'b.png', 'c.png'], initialIndex: 0 },
        attachTo: document.body,
      });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('b.png');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      await nextTick();
      expect(document.querySelector('.ex-file-preview__image')?.getAttribute('src')).toBe('a.png');
    });
  });

  describe('缩放边界', () => {
    it('zoomIn 不超过 maxScale', async () => {
      const wrapper = mount(ExFilePreview, {
        props: { visible: true, file: 'a.png', maxScale: 1.2, scaleStep: 0.1 },
        attachTo: document.body,
      });
      await nextTick();
      const vm = wrapper.vm as any;
      vm.zoomIn();
      vm.zoomIn();
      vm.zoomIn();
      vm.zoomIn();

      const scales = (wrapper.emitted('update:scale') as number[][]).map(e => e[0]);
      expect(Math.max(...scales)).toBeCloseTo(1.2);
      expect(scales.every(s => s <= 1.2 + 1e-9)).toBe(true);
    });

    it('zoomOut 不低于 minScale', async () => {
      const wrapper = mount(ExFilePreview, {
        props: { visible: true, file: 'a.png', minScale: 0.8, scaleStep: 0.1 },
        attachTo: document.body,
      });
      await nextTick();
      const vm = wrapper.vm as any;
      vm.zoomOut();
      vm.zoomOut();
      vm.zoomOut();

      const scales = (wrapper.emitted('update:scale') as number[][]).map(e => e[0]);
      expect(Math.min(...scales)).toBeCloseTo(0.8);
      expect(scales.every(s => s >= 0.8 - 1e-9)).toBe(true);
    });
  });

  describe('键盘与无障碍', () => {
    it('Esc 关闭（useOverlay）', async () => {
      const wrapper = mount(ExFilePreview, {
        props: { visible: true, file: 'a.png', maskClosable: true },
        attachTo: document.body,
      });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();

      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('容器具备 dialog 语义并在打开后获得焦点', async () => {
      mount(ExFilePreview, {
        props: { visible: true, file: 'a.png' },
        attachTo: document.body,
      });
      await nextTick();
      const dialog = document.querySelector('.ex-file-preview') as HTMLElement;
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');

      await wait(80); // 等待 useOverlay 的 autoFocus（双 rAF）
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  describe('文本预览', () => {
    it('通过 fetch 加载文本内容并渲染', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({ text: async () => 'hello text body' }))
      );
      mount(ExFilePreview, {
        props: { visible: true, file: 'note.txt' },
        attachTo: document.body,
      });
      await flushPromises();
      await nextTick();

      const code = document.querySelector('.ex-file-preview__text pre code');
      expect(code?.textContent).toContain('hello text body');
    });
  });

  describe('自定义插槽', () => {
    it('渲染 toolbar 与 footer 插槽', async () => {
      mount(ExFilePreview, {
        props: { visible: true, file: 'a.png' },
        slots: {
          toolbar: '<button class="custom-tb">tb</button>',
          footer: '<div class="custom-ft">ft</div>',
        },
        attachTo: document.body,
      });
      await nextTick();
      expect(document.querySelector('.custom-tb')).toBeTruthy();
      expect(document.querySelector('.ex-file-preview__footer .custom-ft')).toBeTruthy();
    });
  });
});
