import { nextTick, onBeforeUnmount, shallowRef, watch } from 'vue';
import type { ShallowRef } from 'vue';
import { ExFilePreviewError } from './errors';
import type { PreviewFile, PreviewSource } from './types';

export interface PreviewSourceFailure {
  error: ExFilePreviewError;
  file: PreviewFile;
}

export interface UsePreviewSourcesReturn {
  files: ShallowRef<PreviewFile[]>;
  sourceFailure: ShallowRef<PreviewSourceFailure | null>;
}

const isBlobSource = (source: PreviewSource): source is Blob =>
  typeof Blob !== 'undefined' && source instanceof Blob;

const getBlobName = (source: Blob): string | undefined => {
  if (typeof File !== 'undefined' && source instanceof File) return source.name;
  const candidate = (source as Blob & { name?: unknown }).name;
  return typeof candidate === 'string' ? candidate : undefined;
};

/**
 * 统一字符串、描述对象与 Blob/File 来源，并负责对象地址的完整生命周期。
 * 每次来源替换都先建立新快照，再释放旧地址，避免渲染过程引用已失效 URL。
 */
export function usePreviewSources(
  getFile: () => PreviewSource | undefined,
  getFiles: () => PreviewSource[] | undefined
): UsePreviewSourcesReturn {
  const files = shallowRef<PreviewFile[]>([]);
  const sourceFailure = shallowRef<PreviewSourceFailure | null>(null);
  let ownedObjectUrls: string[] = [];

  const revokeObjectUrls = (urls: string[]): void => {
    if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
    for (const url of urls) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // 释放失败不影响组件卸载；浏览器会在文档销毁时回收对应资源。
      }
    }
  };

  const synchronizeSources = (sources: PreviewSource[]): void => {
    const nextObjectUrls: string[] = [];
    let nextFailure: PreviewSourceFailure | null = null;

    const nextFiles = sources.map<PreviewFile>(source => {
      if (typeof source === 'string') return { url: source };
      if (!isBlobSource(source)) return source;

      const file: PreviewFile = {
        url: '',
        name: getBlobName(source),
        mimeType: source.type || undefined,
      };

      try {
        if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
          throw new Error('当前运行环境不支持 Blob 对象地址');
        }
        file.url = URL.createObjectURL(source);
        nextObjectUrls.push(file.url);
      } catch (cause) {
        nextFailure ??= {
          error: new ExFilePreviewError('无法为 Blob/File 创建预览地址', {
            code: 'invalid-source',
            cause,
          }),
          file,
        };
      }

      return file;
    });

    const previousObjectUrls = ownedObjectUrls;
    ownedObjectUrls = nextObjectUrls;
    files.value = nextFiles;
    sourceFailure.value = nextFailure;
    // 等待 Vue 把新地址提交到 DOM，再释放旧地址，避免旧节点在同一渲染帧内失效。
    void nextTick(() => revokeObjectUrls(previousObjectUrls));
  };

  watch(
    () => {
      const multipleSources = getFiles();
      if (multipleSources?.length) return multipleSources;
      const singleSource = getFile();
      return singleSource === undefined ? [] : [singleSource];
    },
    synchronizeSources,
    { deep: true, immediate: true }
  );

  onBeforeUnmount(() => {
    revokeObjectUrls(ownedObjectUrls);
    ownedObjectUrls = [];
  });

  return { files, sourceFailure };
}
