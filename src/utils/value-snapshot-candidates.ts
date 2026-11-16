type StaticFields = ReadonlyMap<string, number>;

interface Posting {
  known: number[];
  byValue: Map<number, number[]>;
  unknown?: number[];
}

interface CandidatePositions {
  exact: readonly number[];
  unknown: readonly number[];
}

interface RankedMember {
  sourceIndex: number;
  fields: StaticFields;
  count: number;
  positions?: CandidatePositions;
}

export interface ReadableCandidates {
  ranked: RankedMember[];
  rightFields: StaticFields[];
}

/** 用静态字段建立候选索引，未读取的访问器字段仍可参与后续完整比较。 */
export function planReadableCandidates(
  left: StaticFields[],
  right: StaticFields[]
): ReadableCandidates | undefined {
  const postings = new Map<string, Posting>();
  right.forEach((fields, index) => {
    for (const [field, value] of fields) {
      let posting = postings.get(field);
      if (!posting) {
        posting = { known: [], byValue: new Map() };
        postings.set(field, posting);
      }
      posting.known.push(index);
      const matches = posting.byValue.get(value);
      if (matches) matches.push(index);
      else posting.byValue.set(value, [index]);
    }
  });
  const ranked: RankedMember[] = [];
  for (const [sourceIndex, fields] of left.entries()) {
    let count = right.length;
    let driver: Posting | undefined;
    let exact: readonly number[] = [];
    for (const [field, value] of fields) {
      const posting = postings.get(field);
      if (!posting) continue;
      const matches = posting.byValue.get(value) ?? [];
      const compatible = right.length - posting.known.length + matches.length;
      if (compatible >= count) continue;
      count = compatible;
      driver = posting;
      exact = matches;
    }
    if (!count) return undefined;
    let positions: CandidatePositions | undefined;
    if (driver) {
      if (!driver.unknown) {
        const unknown: number[] = [];
        let known = 0;
        for (let index = 0; index < right.length; index++) {
          if (driver.known[known] === index) known++;
          else unknown.push(index);
        }
        driver.unknown = unknown;
      }
      positions = { exact, unknown: driver.unknown };
    }
    ranked.push({ sourceIndex, fields, count, positions });
  }
  ranked.sort((a, b) => a.count - b.count);
  return { ranked, rightFields: right };
}

export function readableFieldsAgree(left: StaticFields, right: StaticFields): boolean {
  for (const [field, value] of left) {
    const other = right.get(field);
    if (other !== undefined && value !== other) return false;
  }
  return true;
}

function lowerBound(indices: readonly number[], start: number): number {
  let low = 0;
  let high = indices.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (indices[middle]! < start) low = middle + 1;
    else high = middle;
  }
  return low;
}

/** 合并两份有序候选索引，同时保留指定位置后的回退次序。 */
export function* readablePositions(
  { exact, unknown }: CandidatePositions,
  start: number
): Iterable<number> {
  let first = lowerBound(exact, start);
  let second = lowerBound(unknown, start);
  while (first < exact.length || second < unknown.length) {
    const a = exact[first] ?? Infinity;
    const b = unknown[second] ?? Infinity;
    if (a < b) {
      yield a;
      first++;
    } else {
      yield b;
      second++;
    }
  }
}
