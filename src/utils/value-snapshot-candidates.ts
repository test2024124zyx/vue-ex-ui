type StaticFields = ReadonlyMap<string, number>;

interface Posting {
  known: number[];
  byValue: Map<number, AvailablePositions>;
  unknown?: AvailablePositions;
}

export interface AvailablePositions {
  indices: number[];
  offset: number;
}

interface RankedMember {
  sourceIndex: number;
  fields: StaticFields;
  count: number;
  positions?: readonly AvailablePositions[];
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
      if (matches) matches.indices.push(index);
      else posting.byValue.set(value, { indices: [index], offset: 0 });
    }
  });
  const intersections = new Map<string, AvailablePositions>();
  const ranked: RankedMember[] = [];
  for (const [sourceIndex, sourceFields] of left.entries()) {
    const fields = new Map<string, number>();
    let count = right.length;
    let driver: Posting | undefined;
    let exact: AvailablePositions | undefined;
    for (const [field, value] of sourceFields) {
      const posting = postings.get(field);
      if (!posting) continue;
      const matches = posting.byValue.get(value);
      const compatible = right.length - posting.known.length + (matches?.indices.length ?? 0);
      if (compatible === right.length) continue;
      fields.set(field, value);
      if (compatible >= count) continue;
      count = compatible;
      driver = posting;
      exact = matches;
    }
    if (!count) return undefined;
    let positions: AvailablePositions[] | undefined;
    if (driver) {
      if (!driver.unknown) {
        const unknown: number[] = [];
        let known = 0;
        for (let index = 0; index < right.length; index++) {
          if (driver.known[known] === index) known++;
          else unknown.push(index);
        }
        driver.unknown = { indices: unknown, offset: 0 };
      }
      positions = [];
      if (exact) positions.push(exact);
      if (driver.unknown.indices.length) positions.push(driver.unknown);
      if (fields.size > 1) {
        // 用完整交集的候选数排序，避免约束最强的成员最后才参与匹配。
        const profile = [...fields]
          .map(([field, value]) => `${field}:${value}`)
          .sort()
          .join('|');
        let intersection = intersections.get(profile);
        if (!intersection) {
          const indices: number[] = [];
          for (const position of readablePositions(positions, 0)) {
            if (readableFieldsAgree(fields, right[position]!)) indices.push(position);
          }
          if (!indices.length) return undefined;
          intersection = { indices, offset: 0 };
          intersections.set(profile, intersection);
        }
        count = intersection.indices.length;
        positions = [intersection];
      }
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

function lowerBound({ indices, offset }: AvailablePositions, start: number): number {
  if (offset === indices.length || indices[offset]! >= start) return offset;
  let low = offset;
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
  positions: readonly AvailablePositions[],
  start: number
): Iterable<number> {
  const first = positions[0]!;
  const second = positions[1];
  let aIndex = lowerBound(first, start);
  let bIndex = second ? lowerBound(second, start) : 0;
  while (aIndex < first.indices.length || (second && bIndex < second.indices.length)) {
    const a = first.indices[aIndex] ?? Infinity;
    const b = second?.indices[bIndex] ?? Infinity;
    if (a < b) {
      yield a;
      aIndex++;
    } else {
      yield b;
      bIndex++;
    }
  }
}
