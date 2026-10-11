import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import { debounce } from '../../utils/debounce';
import { SELECT_DEFAULT_REMOTE_DEBOUNCE } from './constants';
import type { ExSelectProps, SelectOptions } from './types';

interface RemoteFailure {
  error: unknown;
  query: string;
}

/** 请求身份和取消信号同时校验，防止不响应 AbortSignal 的客户端提交过期结果。 */
export function useSelectRemote(
  props: ExSelectProps,
  searchQuery: Ref<string>,
  visible: Ref<boolean>,
  blocked: () => boolean,
  onError: (error: unknown, query: string) => void
) {
  const managed = computed(() => Boolean(props.remote && props.remoteLoader));
  const resolvedOptions = shallowRef<SelectOptions>();
  const pending = ref(false);
  const failure = shallowRef<RemoteFailure>();
  const options = computed(() =>
    managed.value ? (resolvedOptions.value ?? props.options ?? []) : (props.options ?? [])
  );
  const loading = computed(() => Boolean(props.loading || pending.value));
  const delay = computed(() => {
    const value = Number(props.remoteDebounce ?? SELECT_DEFAULT_REMOTE_DEBOUNCE);
    return Number.isFinite(value) && value >= 0 ? value : SELECT_DEFAULT_REMOTE_DEBOUNCE;
  });
  let controller: AbortController | undefined;
  let revision = 0;
  let disposed = false;

  const execute = async (query: string, requestRevision: number) => {
    if (disposed || blocked() || !visible.value || !props.remote || requestRevision !== revision) {
      return;
    }
    const loader = props.remoteLoader;
    if (!loader) {
      props.remoteMethod?.(query);
      return;
    }
    const requestController = new AbortController();
    controller = requestController;
    const isCurrent = () =>
      !disposed && requestRevision === revision && !requestController.signal.aborted;
    try {
      const result = await loader(query, { signal: requestController.signal });
      if (!isCurrent()) return;
      resolvedOptions.value = result;
    } catch (error) {
      if (!isCurrent()) return;
      failure.value = { error, query };
      onError(error, query);
    } finally {
      if (isCurrent()) {
        pending.value = false;
        controller = undefined;
      }
    }
  };

  let schedule = debounce((query: string, requestRevision: number) => {
    void execute(query, requestRevision);
  }, delay.value);

  const cancel = () => {
    // 在触发 abort 事件前使旧身份失效，即使客户端同步响应取消也不能回写。
    revision += 1;
    schedule.cancel();
    controller?.abort();
    controller = undefined;
    pending.value = false;
    failure.value = undefined;
  };

  const search = (query: string, immediate = false) => {
    cancel();
    if (disposed || blocked() || !visible.value || !props.remote) return;
    if (managed.value) {
      // 查询变化后立即隐藏旧列表，防抖等待期间也不能误选上一次结果。
      resolvedOptions.value = [];
      pending.value = true;
    }
    if (immediate) void execute(query, revision);
    else schedule(query, revision);
  };

  const open = () => {
    if (managed.value) search(searchQuery.value, true);
  };
  const retry = () => {
    if (failure.value && managed.value) search(failure.value.query, true);
  };

  watch(delay, value => {
    const wasScheduled = schedule.pending();
    schedule.cancel();
    schedule = debounce((query: string, requestRevision: number) => {
      void execute(query, requestRevision);
    }, value);
    if (wasScheduled) search(searchQuery.value);
  });

  watch([() => props.remote, () => props.remoteLoader, () => props.remoteMethod], () => {
    cancel();
    resolvedOptions.value = undefined;
    if (visible.value) open();
  });

  onScopeDispose(() => {
    disposed = true;
    cancel();
  });

  return { managed, options, loading, failure, search, open, retry, cancel };
}
