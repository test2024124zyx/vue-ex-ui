import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import type { UploadFile } from './types';

interface OwnedPreviewUrl {
  raw: File;
  url: string;
}

/** 管理图片本地预览地址，避免把 base64 缩略图写入公开文件列表。 */
export function useUploadPreviewUrls() {
  const ownedUrls = new Map<string, OwnedPreviewUrl>();
  const revision = shallowRef(0);
  let mounted = false;
  let currentFiles: readonly UploadFile[] = [];

  const revokeEntry = (uid: string): void => {
    const entry = ownedUrls.get(uid);
    if (!entry) return;
    ownedUrls.delete(uid);
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(entry.url);
      } catch {
        // 浏览器最终仍会在文档销毁时回收对象地址。
      }
    }
  };

  const synchronize = (files: readonly UploadFile[]): void => {
    currentFiles = files;
    // 对象地址无法跨 SSR 与浏览器共享，挂载前仅记录最新文件快照。
    if (!mounted) return;
    const visibleUids = new Set(files.map(file => file.uid));
    for (const uid of ownedUrls.keys()) {
      if (!visibleUids.has(uid)) revokeEntry(uid);
    }

    for (const file of files) {
      const existing = ownedUrls.get(file.uid);
      const needsOwnedUrl = Boolean(
        file.raw?.type.startsWith('image/') && !file.thumbUrl && !file.url
      );
      if (!needsOwnedUrl || existing?.raw !== file.raw) revokeEntry(file.uid);
      if (!needsOwnedUrl || ownedUrls.has(file.uid) || !file.raw) continue;

      try {
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          ownedUrls.set(file.uid, { raw: file.raw, url: URL.createObjectURL(file.raw) });
        }
      } catch {
        // 缩略图属于增强能力，创建失败不应阻止真实文件上传。
      }
    }
    revision.value += 1;
  };

  const getPreviewUrl = (file: UploadFile): string | undefined => {
    void revision.value;
    return file.thumbUrl || file.url || ownedUrls.get(file.uid)?.url;
  };

  const clear = (): void => {
    for (const uid of [...ownedUrls.keys()]) revokeEntry(uid);
    revision.value += 1;
  };

  onMounted(() => {
    mounted = true;
    synchronize(currentFiles);
  });
  onBeforeUnmount(() => {
    mounted = false;
    currentFiles = [];
    clear();
  });

  return { synchronize, getPreviewUrl, clear };
}
