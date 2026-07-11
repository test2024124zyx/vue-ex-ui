import { describe, expect, it } from 'vitest';
import {
  clampFileListPage,
  collectFileEntries,
  filterAndSortFileEntries,
  flattenFileEntries,
  getFileItemIcon,
  normalizeFileListPageSize,
} from '../../../src/components/file-list/file-list-utils';
import type { FileItem } from '../../../src/components/file-list/types';

const item = (overrides: Partial<FileItem> & Pick<FileItem, 'id' | 'name'>): FileItem => ({
  ...overrides,
});

describe('FileList 数据工具', () => {
  it('递归建立唯一索引，并确定性忽略空标识和后出现的重复标识', () => {
    const input = [
      item({
        id: 'folder',
        name: '资料',
        isDirectory: true,
        children: [item({ id: 'same', name: '首个文件' })],
      }),
      item({ id: 'same', name: '重复文件' }),
      { id: '   ', name: '无效文件' } as FileItem,
    ];

    const collection = collectFileEntries(input);

    expect(collection.entries).toHaveLength(1);
    expect(collection.index.get('same')?.name).toBe('首个文件');
    expect(collection.duplicateIds).toEqual(['same']);
    expect(collection.invalidItemCount).toBe(1);
  });

  it('递归搜索时保留命中项的祖先，并使用语言感知的自然排序', () => {
    const collection = collectFileEntries([
      item({
        id: 'folder',
        name: '归档',
        isDirectory: true,
        children: [
          item({ id: '10', name: 'invoice10.pdf', type: 'application/pdf' }),
          item({ id: '2', name: 'invoice2.pdf', type: 'application/pdf' }),
          item({ id: 'other', name: 'notes.txt', type: 'text/plain' }),
        ],
      }),
    ]);

    const result = filterAndSortFileEntries(collection.entries, {
      keyword: 'INVOICE',
      field: 'name',
      order: 'asc',
      locale: 'en-US',
      includeMatchingAncestors: true,
    });

    expect(result.map(entry => entry.file.id)).toEqual(['folder']);
    expect(result[0]?.children.map(entry => entry.file.id)).toEqual(['2', '10']);
  });

  it('普通列表搜索不因仅有后代命中而显示父目录', () => {
    const collection = collectFileEntries([
      item({
        id: 'folder',
        name: 'archive',
        children: [item({ id: 'child', name: 'target.pdf' })],
      }),
    ]);

    const result = filterAndSortFileEntries(collection.entries, {
      keyword: 'target',
      field: 'name',
      order: 'asc',
      locale: 'en-US',
      includeMatchingAncestors: false,
    });

    expect(result).toEqual([]);
  });

  it.each(['size', 'type', 'modifiedTime'] as const)(
    '%s 排序把缺失或非法值稳定放在末尾，且降序不会把空值移到开头',
    field => {
      const validValue =
        field === 'size'
          ? { size: 10 }
          : field === 'type'
            ? { type: 'text/plain' }
            : { modifiedTime: '2024-01-01T00:00:00Z' };
      const collection = collectFileEntries([
        item({ id: 'missing', name: 'missing' }),
        item({ id: 'valid', name: 'valid', ...validValue }),
      ]);

      for (const order of ['asc', 'desc'] as const) {
        const result = filterAndSortFileEntries(collection.entries, {
          keyword: '',
          field,
          order,
          locale: 'en-US',
          includeMatchingAncestors: false,
        });
        expect(result.map(entry => entry.file.id)).toEqual(['valid', 'missing']);
      }
    }
  );

  it('扁平化结果保持深度优先顺序且不复制文件对象', () => {
    const child = item({ id: 'child', name: 'child' });
    const root = item({ id: 'root', name: 'root', children: [child] });
    const entries = collectFileEntries([root]).entries;

    expect(flattenFileEntries(entries)).toEqual([root, child]);
  });

  it('按目录和 MIME 类型选择图标，缺失类型安全回退', () => {
    expect(getFileItemIcon(item({ id: 'dir', name: 'dir', isDirectory: true }))).toBe(
      'folder-line'
    );
    expect(getFileItemIcon(item({ id: 'image', name: 'a', type: 'image/png' }))).toBe('image-line');
    expect(getFileItemIcon(item({ id: 'archive', name: 'a', type: 'application/x-7z' }))).toBe(
      'file-zip-line'
    );
    expect(getFileItemIcon(item({ id: 'unknown', name: 'a' }))).toBe('file-text-line');
  });

  it('规范化非法分页输入并把页码限制在真实范围内', () => {
    expect(normalizeFileListPageSize(0)).toBe(20);
    expect(normalizeFileListPageSize(Number.NaN)).toBe(20);
    expect(normalizeFileListPageSize(2.9)).toBe(2);
    expect(clampFileListPage(Number.NaN, 4)).toBe(1);
    expect(clampFileListPage(-2, 4)).toBe(1);
    expect(clampFileListPage(9, 4)).toBe(4);
    expect(clampFileListPage(2.9, 4)).toBe(2);
    expect(clampFileListPage(2, 0)).toBe(1);
  });
});
