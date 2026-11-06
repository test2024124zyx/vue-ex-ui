import type { TreeNode } from './types';

/** 已加载分支绑定原始节点，禁止同 key 的新数据意外继承旧缓存。 */
export interface LoadedTreeBranch {
  source: TreeNode;
  children: TreeNode[];
}

/** 后序过滤与节点深度无关，不借助调用栈，也不改写源节点的子数组。 */
export function filterTreeNodes(data: TreeNode[], matches: (node: TreeNode) => boolean) {
  interface Frame {
    nodes: TreeNode[];
    index: number;
    result: TreeNode[];
    owner?: TreeNode;
    match?: boolean;
  }
  const frames: Frame[] = [{ nodes: data, index: 0, result: [] }];
  while (frames.length) {
    const frame = frames[frames.length - 1]!;
    if (frame.index === frame.nodes.length) {
      frames.pop();
      if (!frame.owner) return frame.result;
      if (frame.match || frame.result.length)
        frames[frames.length - 1]!.result.push({
          ...frame.owner,
          children: frame.result.length ? frame.result : frame.owner.children,
        });
      continue;
    }
    const node = frame.nodes[frame.index++]!;
    frames.push({
      nodes: node.children ?? [],
      index: 0,
      result: [],
      owner: node,
      match: matches(node),
    });
  }
  return [];
}

/** 迭代生成有效树和源节点索引，隔离加载后的结构并避免深树递归溢出。 */
export function composeTreeData(data: TreeNode[], branches: ReadonlyMap<string, LoadedTreeBranch>) {
  const nodes = new Map<string, TreeNode>();
  const sources = new Map<string, TreeNode>();
  const output: TreeNode[] = [];
  const pending = data.map(node => ({ node, target: output })).reverse();
  while (pending.length) {
    const { node, target } = pending.pop()!;
    const branch = branches.get(node.key);
    const loaded = branch?.source === node ? branch : undefined;
    const children = loaded?.children ?? node.children;
    // 加载启用时隔离结构，状态查询与用户输入节点始终拥有独立的 children 数组。
    const result = branches.size ? { ...node } : node;
    target.push(result);
    nodes.set(node.key, result);
    sources.set(node.key, node);
    if (children) {
      const childTarget: TreeNode[] = branches.size ? [] : children;
      if (branches.size) result.children = childTarget;
      if (loaded) result.isLeaf = children.length === 0;
      for (let index = children.length - 1; index >= 0; index -= 1) {
        const child = children[index]!;
        // 无缓存时仅建立索引，不向调用方的数组写入节点。
        pending.push({ node: child, target: branches.size ? childTarget : [] });
      }
    }
  }
  return { data: branches.size ? output : data, nodes, sources };
}

/** 校验完整返回子树并复制结构，不接受循环、重复 key 或其他分支的身份冲突。 */
export function validateLoadedChildren(
  value: unknown,
  parent: TreeNode,
  currentNodes: ReadonlyMap<string, TreeNode>
): TreeNode[] {
  if (!Array.isArray(value)) throw new TypeError('Tree loadData must return an array.');
  const availableKeys = new Set(currentNodes.keys());
  const previous = [...(parent.children ?? [])];
  while (previous.length) {
    const node = previous.pop()!;
    availableKeys.delete(node.key);
    for (const child of node.children ?? []) previous.push(child);
  }
  const output: TreeNode[] = [];
  const visited = new Set<object>();
  const pending = value.map(node => ({ node: node as unknown, target: output })).reverse();
  while (pending.length) {
    const { node, target } = pending.pop()!;
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      throw new TypeError('Tree loadData returned an invalid node.');
    }
    const candidate = node as TreeNode;
    if (
      visited.has(node) ||
      typeof candidate.key !== 'string' ||
      typeof candidate.label !== 'string' ||
      availableKeys.has(candidate.key)
    ) {
      throw new TypeError('Tree loadData returned a cyclic node or an invalid or duplicate key.');
    }
    for (const field of ['disabled', 'selectable', 'checkable', 'isLeaf'] as const) {
      if (candidate[field] !== undefined && typeof candidate[field] !== 'boolean') {
        throw new TypeError(`Tree loadData returned an invalid ${field} value.`);
      }
    }
    if (candidate.children !== undefined && !Array.isArray(candidate.children)) {
      throw new TypeError('Tree loadData returned invalid children.');
    }
    availableKeys.add(candidate.key);
    visited.add(node);
    const copy: TreeNode = { ...candidate };
    target.push(copy);
    if (candidate.children) {
      copy.children = [];
      for (let index = candidate.children.length - 1; index >= 0; index -= 1) {
        pending.push({ node: candidate.children[index], target: copy.children });
      }
    }
  }
  return output;
}
