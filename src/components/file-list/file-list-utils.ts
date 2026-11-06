import type { SupportedLocale } from '../../locale';
import type { FileItem, FileItemTime, SortField, SortOrder } from './types';

export interface FileEntry {
  /** 保留调用方原始对象，保证事件和查询不会返回内部克隆。 */
  file: FileItem;
  children: FileEntry[];
}

export interface FileCollection {
  entries: FileEntry[];
  index: Map<string, FileItem>;
  duplicateIds: string[];
  invalidItemCount: number;
}

export interface FileEntryQuery {
  keyword: string;
  field: SortField;
  order: SortOrder;
  locale: SupportedLocale;
  /** 树视图为 true，以便后代命中时保留祖先路径。 */
  includeMatchingAncestors: boolean;
}

const isRuntimeFileItem = (value: unknown): value is FileItem => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FileItem>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.name === 'string'
  );
};

/** 建立递归唯一索引；无效项和后出现的重复项不进入渲染树。 */
export const collectFileEntries = (files: readonly FileItem[]): FileCollection => {
  const index = new Map<string, FileItem>();
  const duplicateIds = new Set<string>();
  let invalidItemCount = 0;

  const visit = (items: readonly FileItem[]): FileEntry[] => {
    const result: FileEntry[] = [];
    for (const candidate of items) {
      if (!isRuntimeFileItem(candidate)) {
        invalidItemCount += 1;
        continue;
      }
      if (index.has(candidate.id)) {
        duplicateIds.add(candidate.id);
        continue;
      }

      index.set(candidate.id, candidate);
      const children = Array.isArray(candidate.children) ? visit(candidate.children) : [];
      result.push({ file: candidate, children });
    }
    return result;
  };

  return {
    entries: visit(Array.isArray(files) ? files : []),
    index,
    duplicateIds: [...duplicateIds],
    invalidItemCount,
  };
};

const parseTime = (value: FileItemTime | undefined): number | null => {
  if (value === undefined) return null;
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const finiteSize = (value: number | undefined): number | null =>
  value !== undefined && Number.isFinite(value) && value >= 0 ? value : null;

const normalizedType = (value: string | undefined): string | null => {
  const type = value?.trim();
  return type ? type : null;
};

const compareNullable = <T>(
  left: T | null,
  right: T | null,
  compare: (a: T, b: T) => number,
  order: SortOrder
): number => {
  // 缺失值始终放在末尾，避免降序时未知数据反而占据首位。
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  const result = compare(left, right);
  return order === 'asc' ? result : -result;
};

const createEntryComparator = (
  field: SortField,
  order: SortOrder,
  collator: Intl.Collator
): ((left: FileEntry, right: FileEntry) => number) => {
  switch (field) {
    case 'size':
      return (left, right) =>
        compareNullable(
          finiteSize(left.file.size),
          finiteSize(right.file.size),
          (a, b) => a - b,
          order
        );
    case 'type':
      return (left, right) =>
        compareNullable(
          normalizedType(left.file.type),
          normalizedType(right.file.type),
          collator.compare,
          order
        );
    case 'modifiedTime':
      return (left, right) =>
        compareNullable(
          parseTime(left.file.modifiedTime),
          parseTime(right.file.modifiedTime),
          (a, b) => a - b,
          order
        );
    case 'name':
    default:
      return (left, right) => {
        const result = collator.compare(left.file.name, right.file.name);
        return order === 'asc' ? result : -result;
      };
  }
};

/** 递归稳定排序，并按视图需要决定后代命中时是否保留祖先。 */
export const filterAndSortFileEntries = (
  entries: readonly FileEntry[],
  query: FileEntryQuery
): FileEntry[] => {
  const collator = new Intl.Collator(query.locale, {
    numeric: true,
    sensitivity: 'base',
  });
  const compare = createEntryComparator(query.field, query.order, collator);
  const keyword = query.keyword.trim().toLocaleLowerCase(query.locale);

  const sortRecursively = (items: readonly FileEntry[]): FileEntry[] =>
    items
      .map((entry, index) => ({
        entry: {
          file: entry.file,
          children: sortRecursively(entry.children),
        },
        index,
      }))
      .sort((left, right) => compare(left.entry, right.entry) || left.index - right.index)
      .map(({ entry }) => entry);

  const sorted = sortRecursively(entries);
  if (!keyword) return sorted;

  const filter = (items: readonly FileEntry[]): FileEntry[] => {
    const result: FileEntry[] = [];
    for (const entry of items) {
      const matchesSelf = entry.file.name.toLocaleLowerCase(query.locale).includes(keyword);
      if (matchesSelf) {
        result.push(entry);
        continue;
      }
      if (!query.includeMatchingAncestors) continue;

      const matchingChildren = filter(entry.children);
      if (matchingChildren.length > 0) {
        result.push({ file: entry.file, children: matchingChildren });
      }
    }
    return result;
  };

  return filter(sorted);
};

/** 将内部条目树展平为调用方原始文件对象。 */
export const flattenFileEntries = (entries: readonly FileEntry[]): FileItem[] => {
  const result: FileItem[] = [];
  const visit = (items: readonly FileEntry[]) => {
    for (const entry of items) {
      result.push(entry.file);
      visit(entry.children);
    }
  };
  visit(entries);
  return result;
};

/** 根据目录和 MIME 类型选择内置文件图标。 */
export const getFileItemIcon = (file: FileItem): string => {
  if (file.isDirectory) return 'folder-line';

  const type = file.type?.trim().toLowerCase() ?? '';
  if (type.startsWith('image/')) return 'image-line';
  if (type.startsWith('video/')) return 'video-line';
  if (type.startsWith('audio/')) return 'music-line';
  if (type === 'application/pdf') return 'file-pdf-line';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) {
    return 'file-zip-line';
  }
  if (type.includes('word') || type.includes('document')) return 'file-word-line';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'file-excel-line';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'file-ppt-line';
  return 'file-text-line';
};

/** 把每页数量收敛为正整数，非法输入使用稳定默认值。 */
export const normalizeFileListPageSize = (value: number, fallback = 20): number => {
  const normalizedFallback = Number.isFinite(fallback) && fallback >= 1 ? Math.floor(fallback) : 20;
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : normalizedFallback;
};

/** 把页码限制为真实页数范围内的正整数。 */
export const clampFileListPage = (value: number, totalPages: number): number => {
  const safeTotal = Number.isFinite(totalPages) && totalPages >= 1 ? Math.floor(totalPages) : 1;
  const safePage = Number.isFinite(value) ? Math.floor(value) : 1;
  return Math.min(safeTotal, Math.max(1, safePage));
};

/** 解析可选文件时间，非法值返回 null 供视图显示占位符。 */
export const getFileItemTimestamp = (value: FileItemTime | undefined): number | null =>
  parseTime(value);
