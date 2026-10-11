import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import type { ExTreeProps, TreeNode, TreeNodeLoadState } from './types';
import { composeTreeData, validateLoadedChildren } from './tree-data';
import type { LoadedTreeBranch } from './tree-data';

interface TreeLoaderOptions {
  props: Readonly<ExTreeProps>;
  onLoad: (node: TreeNode, children: TreeNode[]) => void;
  onError: (error: unknown, node: TreeNode) => void;
}

interface PendingTreeLoad {
  controller: AbortController;
  promise: Promise<boolean>;
  settle: (loaded: boolean) => void;
  expandedOnly: boolean;
}

/** 每棵树独立管理请求和缓存，不共享请求身份或修改外部树数据。 */
export function useTreeLoader({ props, onLoad, onError }: TreeLoaderOptions) {
  const branches = shallowRef(new Map<string, LoadedTreeBranch>());
  const states = shallowRef(new Map<string, TreeNodeLoadState>());
  const tree = computed(() => composeTreeData(props.data, branches.value));
  const pending = new Map<string, PendingTreeLoad>();
  const cancelled = new Set<string>();
  let expanded = new Set<string>();
  let mounted = false;
  let disposed = false;

  const setState = (key: string, state: TreeNodeLoadState) => {
    const next = new Map(states.value);
    next.set(key, state);
    states.value = next;
  };
  const getNodeLoadState = (key: string): TreeNodeLoadState => ({
    ...(states.value.get(key) ?? { status: 'idle' }),
  });
  const cancelNodeLoad = (key: string): boolean => {
    const request = pending.get(key);
    if (!request) return false;
    pending.delete(key);
    cancelled.add(key);
    request.controller.abort();
    request.settle(false);
    setState(key, { status: branches.value.has(key) ? 'loaded' : 'idle' });
    return true;
  };
  const invalidate = () => {
    for (const key of pending.keys()) cancelNodeLoad(key);
    branches.value = new Map();
    states.value = new Map();
    cancelled.clear();
    expanded = new Set();
  };
  watch([() => props.data, () => props.loadData], invalidate, { deep: true, flush: 'sync' });

  const loadNode = (key: string, force = false): Promise<boolean> => {
    const node = tree.value.nodes.get(key);
    const source = tree.value.sources.get(key);
    const loader = props.loadData;
    if (
      disposed ||
      !mounted ||
      !loader ||
      !node ||
      !source ||
      props.disabled ||
      node.disabled ||
      source.isLeaf
    ) {
      return Promise.resolve(false);
    }
    const existing = pending.get(key);
    if (existing && !force) return existing.promise;
    if (force) cancelNodeLoad(key);
    else if (branches.value.has(key) || node.children?.length) return Promise.resolve(true);
    if (!force && (cancelled.has(key) || states.value.get(key)?.status === 'error')) {
      return Promise.resolve(false);
    }
    cancelled.delete(key);
    const controller = new AbortController();
    let settle!: (loaded: boolean) => void;
    const promise = new Promise<boolean>(resolve => {
      settle = resolve;
    });
    const request: PendingTreeLoad = { controller, promise, settle, expandedOnly: !force };
    pending.set(key, request);
    setState(key, { status: 'loading' });
    const isCurrent = () => !disposed && pending.get(key) === request && !controller.signal.aborted;

    // 同步抛错、非标准 thenable 与不响应取消的请求都走同一代次检查。
    void (async () => {
      try {
        const result = await loader(node, { signal: controller.signal });
        if (!isCurrent()) return;
        const current = tree.value.nodes.get(key)!;
        const children = validateLoadedChildren(result, current, tree.value.nodes);
        const next = new Map(branches.value);
        // 重载父节点时移除旧后代缓存和在途请求，避免同 key 子节点复用旧世代。
        const descendants = [...(current.children ?? [])];
        const nextStates = new Map(states.value);
        while (descendants.length) {
          const descendant = descendants.pop()!;
          cancelNodeLoad(descendant.key);
          next.delete(descendant.key);
          nextStates.delete(descendant.key);
          cancelled.delete(descendant.key);
          for (const child of descendant.children ?? []) descendants.push(child);
        }
        next.set(key, { source, children });
        pending.delete(key);
        branches.value = next;
        states.value = nextStates;
        setState(key, { status: 'loaded' });
        settle(true);
        const loadedNode = tree.value.nodes.get(key)!;
        onLoad(loadedNode, validateLoadedChildren(children, loadedNode, tree.value.nodes));
      } catch (error) {
        if (!isCurrent()) return;
        pending.delete(key);
        setState(key, { status: 'error', error });
        onError(error, node);
        settle(false);
      }
    })();
    return promise;
  };

  const isExpandable = (node: TreeNode): boolean =>
    Boolean(node.children?.length) ||
    Boolean(props.loadData && node.isLeaf === false && !branches.value.has(node.key));

  const syncExpanded = (keys: readonly string[]) => {
    const requested = new Set(keys);
    const next = new Set<string>();
    const visible = [...tree.value.data];
    // 后代虽然保留展开 key，祖先收起时仍必须停止隐藏分支的自动请求。
    while (visible.length && !props.disabled) {
      const node = visible.pop()!;
      if (!requested.has(node.key)) continue;
      next.add(node.key);
      for (const child of node.children ?? []) visible.push(child);
    }
    for (const [key, request] of pending) {
      if ((request.expandedOnly && !next.has(key)) || props.disabled) cancelNodeLoad(key);
    }
    for (const key of next) {
      if (!expanded.has(key)) {
        cancelled.delete(key);
        if (states.value.get(key)?.status === 'error') setState(key, { status: 'idle' });
      }
      const node = tree.value.nodes.get(key);
      if (node && isExpandable(node)) void loadNode(key);
    }
    expanded = next;
  };

  // 服务端只输出已有节点，浏览器挂载后再发起受组件生命周期管理的请求。
  onMounted(() => {
    mounted = true;
    syncExpanded([...expanded]);
  });
  onBeforeUnmount(() => {
    disposed = true;
    invalidate();
  });
  return {
    tree,
    isExpandable,
    syncExpanded,
    reloadNode: (key: string) => loadNode(key, true),
    cancelNodeLoad,
    getNodeLoadState,
  };
}
