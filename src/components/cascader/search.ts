import type { CascaderOption } from './types';

/** 搜索结果保留完整路径和祖先禁用状态。 */
export interface CascaderSearchResult {
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

/** 使用显式栈遍历叶子路径，避免深层组织数据耗尽 JavaScript 调用栈。 */
export function collectCascaderLeafPaths(options: CascaderOption[]): CascaderSearchResult[] {
  interface Frame extends CascaderSearchResult {
    options: CascaderOption[];
    index: number;
  }
  const frames: Frame[] = [{ options, index: 0, labels: [], values: [], disabled: false }];
  const results: CascaderSearchResult[] = [];
  while (frames.length) {
    const frame = frames[frames.length - 1]!;
    const option = frame.options[frame.index++];
    if (!option) {
      frames.pop();
      continue;
    }
    const path = {
      labels: [...frame.labels, option.label],
      values: [...frame.values, option.value],
      disabled: frame.disabled || Boolean(option.disabled),
    };
    if (option.children?.length) {
      frames.push({ ...path, options: option.children, index: 0 });
    } else if (option.isLeaf !== false) results.push(path);
  }
  return results;
}
