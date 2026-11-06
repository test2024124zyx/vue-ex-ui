interface GraphemeSegment {
  segment: string;
}

interface GraphemeSegmenter {
  segment: (value: string) => Iterable<GraphemeSegment>;
}

type GraphemeSegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity: 'grapheme' }
) => GraphemeSegmenter;

/** 返回首个用户可感知字符，避免拆开 emoji、旗帜或组合音标。 */
export function getFirstGrapheme(value: string): string {
  const normalized = value.trim();
  if (!normalized) return '';

  // 当前 TypeScript 目标库未声明 Segmenter，因此在不放宽 tsconfig 的前提下局部描述其契约。
  const Segmenter = (Intl as typeof Intl & { Segmenter?: GraphemeSegmenterConstructor }).Segmenter;
  if (typeof Segmenter === 'function') {
    const segments = new Segmenter(undefined, { granularity: 'grapheme' }).segment(normalized);
    const iterator = segments[Symbol.iterator]();
    return iterator.next().value?.segment ?? '';
  }

  // 旧运行环境至少按 Unicode 码点切分，避免拆开代理对。
  return Array.from(normalized)[0] ?? '';
}
