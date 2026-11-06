import { logger } from './logger';

/** 迭代后序遍历只复制受循环边影响的祖先，合法树保留原始对象和数组引用。 */
export function pruneTreeCycles<T extends { children?: T[] }>(data: T[], component: string): T[] {
  interface Frame {
    source: T[];
    result: T[];
    index: number;
    owner?: T;
  }
  const frames: Frame[] = [{ source: data, result: [], index: 0 }];
  const ancestors = new Set<T>();
  let result = data;
  let skipped = 0;
  while (frames.length) {
    const frame = frames[frames.length - 1]!;
    if (frame.index >= frame.source.length) {
      frames.pop();
      const unchanged =
        frame.result.length === frame.source.length &&
        frame.result.every((node, index) => node === frame.source[index]);
      const children = unchanged ? frame.source : frame.result;
      if (frame.owner) {
        ancestors.delete(frame.owner);
        frames[frames.length - 1]!.result.push(
          unchanged ? frame.owner : { ...frame.owner, children }
        );
      } else result = children;
      continue;
    }
    const node = frame.source[frame.index++]!;
    if (ancestors.has(node)) {
      skipped += 1;
      continue;
    }
    const children = node.children;
    if (Array.isArray(children) && children.length) {
      ancestors.add(node);
      frames.push({ source: children, result: [], index: 0, owner: node });
    } else frame.result.push(node);
  }
  if (skipped) logger.warn(`${component} 已跳过 ${skipped} 条循环引用边，保留其余合法节点`);
  return result;
}
