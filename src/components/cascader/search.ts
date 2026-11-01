import type { CascaderOption } from './types';

/** 搜索结果保留完整路径和祖先禁用状态。 */
export interface CascaderSearchResult {
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

/** 使用显式栈遍历叶子路径，避免深层组织数据耗尽 JavaScript 调用栈。 */
export function collectCascaderLeafPaths(options: CascaderOption[]): CascaderSearchResult[] {
  interface Frame {
    options: CascaderOption[];
    index: number;
    disabled: boolean;
  }
  const frames: Frame[] = [{ options, index: 0, disabled: false }];
  const labels: string[] = [];
  const values: (string | number)[] = [];
  const results: CascaderSearchResult[] = [];
  while (frames.length) {
    const frame = frames[frames.length - 1]!;
    const option = frame.options[frame.index++];
    if (!option) {
      frames.pop();
      labels.pop();
      values.pop();
      continue;
    }
    labels.push(option.label);
    values.push(option.value);
    const disabled = frame.disabled || Boolean(option.disabled);
    if (option.children?.length) {
      frames.push({ disabled, options: option.children, index: 0 });
    } else {
      // 只有输出叶子结果时复制路径，深链不再保留每一层的完整祖先副本。
      if (option.isLeaf !== false)
        results.push({ labels: [...labels], values: [...values], disabled });
      labels.pop();
      values.pop();
    }
  }
  return results;
}
