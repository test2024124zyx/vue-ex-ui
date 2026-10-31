import { describe, expect, it } from 'vitest';
import {
  collectFileEntries,
  filterAndSortFileEntries,
  getFileItemIcon,
  normalizeFileListPageSize,
} from '../../../src/components/file-list/file-list-utils';

describe('文件列表元数据边界', () => {
  it.each([
    ['video/mp4', 'video-line'],
    ['audio/mpeg', 'music-line'],
    ['application/vnd.ms-powerpoint', 'file-ppt-line'],
  ])('类型 %s 使用对应媒体图标', (type, icon) => {
    expect(getFileItemIcon({ id: 'a', name: '附件', type })).toBe(icon);
  });

  it('未知大小在升降序均排到已知数据之后，同值保持输入顺序', () => {
    const { entries } = collectFileEntries([
      { id: 'unknown-a', name: '未知甲' },
      { id: 'known', name: '已知', size: 10 },
      { id: 'unknown-b', name: '未知乙' },
    ]);
    for (const order of ['asc', 'desc'] as const) {
      const sorted = filterAndSortFileEntries(entries, {
        field: 'size',
        order,
        keyword: '',
        locale: 'zh-CN',
        includeMatchingAncestors: false,
      });
      expect(sorted.map(entry => entry.file.id)).toEqual(['known', 'unknown-a', 'unknown-b']);
    }
    expect(normalizeFileListPageSize(Number.NaN, Number.NaN)).toBe(20);
  });
});
