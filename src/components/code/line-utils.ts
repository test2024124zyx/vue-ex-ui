/** 将行号规范为从 1 开始的有限整数。 */
export const normalizeLineNumber = (value: number, fallback = 1): number => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.trunc(value));
};

/** 将 Tab 宽度限制在可控范围，避免 repeat 接收无穷值。 */
export const normalizeTabSize = (value: number): number => {
  if (!Number.isFinite(value)) return 2;
  return Math.min(16, Math.max(1, Math.trunc(value)));
};

/**
 * 解析高亮行号，只展开当前渲染区间的交集。
 * 即使调用方传入极大范围，循环次数也不会超过可见行数。
 */
export const parseHighlightedLines = (
  source: string | readonly number[] | undefined,
  firstVisibleLine: number,
  lastVisibleLine: number
): Set<number> => {
  const result = new Set<number>();
  if (!source || lastVisibleLine < firstVisibleLine) return result;

  const addLine = (value: number) => {
    if (
      Number.isFinite(value) &&
      Number.isInteger(value) &&
      value >= firstVisibleLine &&
      value <= lastVisibleLine
    ) {
      result.add(value);
    }
  };

  if (typeof source !== 'string') {
    source.forEach(addLine);
    return result;
  }

  for (const segment of source.split(',')) {
    const match = segment.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match?.[1]) continue;

    const start = Number(match[1]);
    const end = match[2] === undefined ? start : Number(match[2]);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) continue;

    const boundedStart = Math.max(start, firstVisibleLine);
    const boundedEnd = Math.min(end, lastVisibleLine);
    for (let line = boundedStart; line <= boundedEnd; line += 1) {
      result.add(line);
    }
  }

  return result;
};
