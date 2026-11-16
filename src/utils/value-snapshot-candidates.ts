type StaticFields = ReadonlyMap<string, number>;

interface Bucket {
  groups: number[];
  size: number;
}

interface Posting {
  id: number;
  known: Bucket;
  byValue: Map<number, Bucket>;
  unknown?: number[];
}

export interface AvailablePositions {
  indices: number[];
  offset: number;
}

interface CandidateDomain {
  groups: number[];
  count: number;
  demand: number;
  positions?: AvailablePositions;
}

interface RankedMember {
  sourceIndex: number;
  fields: StaticFields;
  domain: CandidateDomain;
}

export interface ReadableCandidates {
  ranked: RankedMember[];
  rightFields: StaticFields[];
}

interface Slot {
  available: number;
  owners: Map<CandidateDomain, number>;
}

function transferCapacity(root: CandidateDomain, slots: Slot[], demand: number): number {
  const via = new Map<CandidateDomain, number>([[root, -1]]);
  const parents = new Map<number, CandidateDomain>();
  const queue = [root];
  for (const domain of queue) {
    for (const index of domain.groups) {
      if (parents.has(index)) continue;
      parents.set(index, domain);
      const slot = slots[index]!;
      if (slot.available) {
        // 增广路径把已分配名额移向有余量的组，给当前成员腾出位置。
        let count = Math.min(slot.available, demand);
        const path: Array<{ slot: Slot; owner: CandidateDomain }> = [];
        for (let next = index; next >= 0;) {
          const owner = parents.get(next)!;
          path.push({ slot: slots[next]!, owner });
          next = via.get(owner)!;
          if (next >= 0) count = Math.min(count, slots[next]!.owners.get(owner)!);
        }
        slot.available -= count;
        path.forEach(({ slot, owner }, index) => {
          const previous = path[index - 1]?.owner;
          if (previous) {
            const remaining = slot.owners.get(previous)! - count;
            if (remaining) slot.owners.set(previous, remaining);
            else slot.owners.delete(previous);
          }
          slot.owners.set(owner, (slot.owners.get(owner) ?? 0) + count);
        });
        return count;
      }
      for (const owner of slot.owners.keys()) {
        if (via.has(owner)) continue;
        via.set(owner, index);
        queue.push(owner);
      }
    }
  }
  return 0;
}

function canAssignCandidates(domains: CandidateDomain[], sizes: number[]): boolean {
  const slots: Slot[] = sizes.map(available => ({ available, owners: new Map() }));
  for (const domain of domains) {
    if (domain.demand > domain.count) return false;
    let remaining = domain.demand;
    for (const index of domain.groups) {
      const slot = slots[index]!;
      const count = Math.min(remaining, slot.available);
      if (!count) continue;
      slot.available -= count;
      slot.owners.set(domain, count);
      remaining -= count;
      if (!remaining) break;
    }
    while (remaining) {
      const count = transferCapacity(domain, slots, remaining);
      if (!count) return false;
      remaining -= count;
    }
  }
  return true;
}

function addToBucket(bucket: Bucket, group: number, size: number): void {
  bucket.groups.push(group);
  bucket.size += size;
}

/** 用静态字段和候选容量预筛选，访问器的实际值由快照比较确认。 */
export function planReadableCandidates(
  left: StaticFields[],
  right: StaticFields[]
): ReadableCandidates | undefined {
  const groups: Array<{ fields: StaticFields; indices: number[] }> = [];
  const groupsByFields = new Map<string, number[]>();
  right.forEach((fields, index) => {
    const key = [...fields]
      .map(([field, value]) => `${field}:${value}`)
      .sort()
      .join('|');
    let indices = groupsByFields.get(key);
    if (!indices) {
      indices = [];
      groupsByFields.set(key, indices);
      groups.push({ fields, indices });
    }
    indices.push(index);
  });

  const postings = new Map<string, Posting>();
  groups.forEach(({ fields, indices }, group) => {
    for (const [field, value] of fields) {
      let posting = postings.get(field);
      if (!posting) {
        posting = { id: postings.size, known: { groups: [], size: 0 }, byValue: new Map() };
        postings.set(field, posting);
      }
      addToBucket(posting.known, group, indices.length);
      let matches = posting.byValue.get(value);
      if (!matches) {
        matches = { groups: [], size: 0 };
        posting.byValue.set(value, matches);
      }
      addToBucket(matches, group, indices.length);
    }
  });

  const allGroups = [...groups.keys()];
  const domainsByGroups = new Map<string, CandidateDomain>();
  const domainsByConstraints = new Map<string, CandidateDomain>();
  const ranked: RankedMember[] = [];
  for (const [sourceIndex, fields] of left.entries()) {
    let size = right.length;
    let driver: Posting | undefined;
    let exact: Bucket | undefined;
    const constraints: string[] = [];
    for (const [field, value] of fields) {
      const posting = postings.get(field);
      if (!posting) continue;
      const matches = posting.byValue.get(value);
      const compatible = right.length - posting.known.size + (matches?.size ?? 0);
      if (compatible === right.length) continue;
      // 同一列没有精确候选的值都会使用相同的访问器候选。
      constraints.push(`${posting.id}:${matches?.groups[0] ?? -1}`);
      if (compatible >= size) continue;
      size = compatible;
      driver = posting;
      exact = matches;
    }
    if (!size) return undefined;
    const signature = constraints.sort().join('|');
    let domain = domainsByConstraints.get(signature);
    if (!domain) {
      let compatible = allGroups;
      if (driver) {
        if (!driver.unknown) {
          const known = new Set(driver.known.groups);
          driver.unknown = allGroups.filter(group => !known.has(group));
        }
        compatible = [...driver.unknown, ...(exact?.groups ?? [])];
        if (constraints.length > 1)
          compatible = compatible.filter(group =>
            readableFieldsAgree(fields, groups[group]!.fields)
          );
        if (!compatible.length) return undefined;
        compatible.sort((a, b) => a - b);
      }
      const groupKey = compatible.join(',');
      domain = domainsByGroups.get(groupKey);
      if (!domain) {
        const count = compatible.reduce((total, group) => total + groups[group]!.indices.length, 0);
        const positions =
          count === right.length
            ? undefined
            : {
                indices: compatible.flatMap(group => groups[group]!.indices).sort((a, b) => a - b),
                offset: 0,
              };
        domain = { groups: compatible, count, demand: 0, positions };
        domainsByGroups.set(groupKey, domain);
      }
      domainsByConstraints.set(signature, domain);
    }
    domain.demand++;
    ranked.push({ sourceIndex, fields, domain });
  }
  // 先验证静态候选可覆盖全部成员，再检查访问器、循环和共享引用。
  const domains = [...domainsByGroups.values()].sort((a, b) => a.count - b.count);
  const sizes = groups.map(group => group.indices.length);
  if (!canAssignCandidates(domains, sizes)) return undefined;
  ranked.sort((a, b) => a.domain.count - b.domain.count);
  return { ranked, rightFields: right };
}

export function readableFieldsAgree(left: StaticFields, right: StaticFields): boolean {
  for (const [field, value] of left) {
    const other = right.get(field);
    if (other !== undefined && value !== other) return false;
  }
  return true;
}

/** 保留右侧插入顺序，并用二分定位回退后的起点。 */
export function firstReadablePosition(
  { indices, offset }: AvailablePositions,
  start: number
): number {
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
