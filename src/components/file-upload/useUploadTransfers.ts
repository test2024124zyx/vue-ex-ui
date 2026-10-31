import { watch } from 'vue';
import type { Ref, ShallowRef } from 'vue';
import { ExFileUploadError } from './errors';
import { createUploadRequest } from './upload-request';
import type { UploadRequestHandle } from './upload-request';
import { createTusUploadRequest, terminateTusUploadResource } from './tus-upload';
import type { TusUploadHandle } from './tus-upload';
import { createUploadScheduler } from './upload-scheduler';
import { cloneUploadFileList, getUploadResponseUrl, normalizeUploadPercent } from './upload-utils';
import type {
  ExFileUploadEmits,
  ExFileUploadProps,
  UploadAbortReason,
  UploadFile,
  UploadResult,
} from './types';
import type { UploadCancelResult } from './tus-types';

type Emit = <K extends keyof ExFileUploadEmits>(event: K, ...args: ExFileUploadEmits[K]) => void;
interface TransferOptions {
  props: Readonly<ExFileUploadProps>;
  files: ShallowRef<UploadFile[]>;
  disabled: Readonly<Ref<boolean>>;
  mutationDisabled: Readonly<Ref<boolean>>;
  destroyed: Readonly<Ref<boolean>>;
  patchFile: (
    uid: string,
    patch: Partial<UploadFile>
  ) => { file: UploadFile; files: UploadFile[] } | null;
  emit: Emit;
}
interface ActiveUpload {
  file: UploadFile;
  handle: UploadRequestHandle;
  result: Promise<UploadResult>;
  stopped?: 'paused' | 'aborted';
}

/** 统一排队、协议任务与列表提交权，拒绝卸载、换文件和取消后迟到的回调。 */
export function useUploadTransfers(options: TransferOptions) {
  const { props, files, disabled, mutationDisabled, destroyed, patchFile, emit } = options;
  const active = new Map<string, ActiveUpload>();
  const sessions = new Map<string, { file: UploadFile; handle: TusUploadHandle }>();
  const cancellations = new Map<string, Promise<UploadCancelResult>>();
  const cancellationControllers = new Map<string, AbortController>();
  const cancellationFiles = new Map<string, UploadFile>();
  const scheduler = createUploadScheduler(() => props.concurrency);
  watch(() => props.concurrency, scheduler.update);
  const snapshot = () => cloneUploadFileList(files.value);
  const blockedReason = () => (disabled.value ? 'disabled' : 'readonly');
  const stoppedResult = (task: ActiveUpload): UploadResult => ({
    uid: task.file.uid,
    outcome: task.stopped ?? 'aborted',
  });
  const targets = (file?: UploadFile | string) => {
    if (typeof file === 'string') return files.value.filter(item => item.uid === file);
    if (file) return [files.value.find(item => item.uid === file.uid) ?? file];
    return [...files.value];
  };

  const abortActiveUpload = (uid: string, reason: UploadAbortReason): boolean => {
    const task = active.get(uid);
    if (!task) return false;
    const aborted = task.handle.abort();
    if (!aborted && reason !== 'external') return false;
    task.stopped = reason === 'pause' ? 'paused' : 'aborted';
    active.delete(uid);
    const current = files.value.find(file => file.uid === uid);
    const patch: Partial<UploadFile> = {
      status: reason === 'pause' ? 'paused' : 'ready',
      percent: reason === 'pause' ? (current?.percent ?? 0) : 0,
      error: undefined,
    };
    const changed = current?.raw === task.file.raw ? patchFile(uid, patch) : null;
    const file = changed?.file ?? { ...task.file, ...patch };
    const list = changed?.files ?? snapshot();
    if (reason === 'pause') emit('paused', file, list);
    else emit('aborted', file, list, reason);
    return true;
  };
  const abortUploads = (uids: readonly string[], reason: UploadAbortReason) =>
    uids.reduce((count, uid) => count + Number(abortActiveUpload(uid, reason)), 0);

  const startUpload = (source: UploadFile): Promise<UploadResult> => {
    const existing = active.get(source.uid);
    if (existing) return existing.result;
    if (mutationDisabled.value || destroyed.value) {
      return Promise.resolve({ uid: source.uid, outcome: 'ignored', reason: blockedReason() });
    }
    const file = files.value.find(item => item.uid === source.uid) ?? source;
    if (!['ready', 'paused', 'error'].includes(file.status) || cancellations.has(file.uid)) {
      return Promise.resolve({ uid: file.uid, outcome: 'ignored', reason: 'not-ready' });
    }
    if (!props.action)
      return Promise.resolve({ uid: file.uid, outcome: 'ignored', reason: 'no-action' });
    if (!file.raw)
      return Promise.resolve({ uid: file.uid, outcome: 'ignored', reason: 'missing-raw' });
    const task = { file } as ActiveUpload;
    const isCurrent = () => !destroyed.value && active.get(file.uid) === task;
    patchFile(file.uid, {
      status: 'queued',
      error: undefined,
      percent: props.transport === 'tus' ? (file.percent ?? 0) : 0,
    });
    const handle = scheduler.enqueue(() => {
      patchFile(file.uid, { status: 'uploading', error: undefined });
      const requestOptions = {
        file,
        action: props.action!,
        headers: props.headers,
        withCredentials: props.withCredentials,
        timeout: props.timeout,
        onProgress: (percent: number) => {
          if (!isCurrent()) return;
          const previous = files.value.find(item => item.uid === file.uid)?.percent ?? 0;
          const changed = patchFile(file.uid, {
            percent: Math.max(previous, normalizeUploadPercent(percent)),
          });
          if (changed) emit('progress', changed.file, changed.files);
        },
      };
      if (props.transport === 'tus') {
        const tusHandle = createTusUploadRequest({
          ...requestOptions,
          tus: props.tus,
          uploadUrl: file.tusUploadUrl,
          onUploadUrl: url => {
            if (isCurrent()) patchFile(file.uid, { tusUploadUrl: url });
          },
          onResumeUnavailable: error => {
            if (isCurrent()) emit('resume-unavailable', error, { ...file });
          },
        });
        sessions.set(file.uid, { file, handle: tusHandle });
        return tusHandle;
      }
      return createUploadRequest({
        ...requestOptions,
        method: props.method,
        data: props.data,
        name: props.name,
      });
    });
    task.handle = handle;
    task.result = handle.promise.then(result => {
      if (!isCurrent()) return stoppedResult(task);
      active.delete(file.uid);
      if (result.outcome === 'aborted') {
        const changed = patchFile(file.uid, { status: 'ready', percent: 0 });
        emit(
          'aborted',
          changed?.file ?? { ...file, status: 'ready', percent: 0 },
          changed?.files ?? snapshot(),
          'manual'
        );
        return stoppedResult(task);
      }
      if (result.outcome === 'error') {
        const changed = patchFile(file.uid, { status: 'error', error: result.error.message });
        emit(
          'error',
          result.error,
          changed?.file ?? { ...file, status: 'error', error: result.error.message },
          changed?.files ?? snapshot()
        );
        return { uid: file.uid, ...result };
      }
      const url = getUploadResponseUrl(result.response);
      const patch = {
        status: 'success' as const,
        percent: 100,
        response: result.response,
        error: undefined,
        ...(url ? { url } : {}),
      };
      const changed = patchFile(file.uid, patch);
      emit(
        'success',
        result.response,
        changed?.file ?? { ...file, ...patch },
        changed?.files ?? snapshot()
      );
      return { uid: file.uid, ...result };
    });
    active.set(file.uid, task);
    if (['paused', 'error'].includes(file.status)) emit('resumed', { ...file }, snapshot());
    return task.result;
  };
  const submit = (file?: UploadFile | string) =>
    Promise.all(
      targets(file)
        .filter(item => file || ['ready', 'paused', 'error'].includes(item.status))
        .map(startUpload)
    );
  const abort = (file?: UploadFile | string) =>
    abortUploads(file ? targets(file).map(item => item.uid) : [...active.keys()], 'manual');
  const pause = (file?: UploadFile | string) =>
    props.transport === 'tus'
      ? abortUploads(file ? targets(file).map(item => item.uid) : [...active.keys()], 'pause')
      : 0;
  const resume = (file?: UploadFile | string) => {
    const list = targets(file).filter(item => file || ['paused', 'error'].includes(item.status));
    return Promise.all(list.map(startUpload));
  };

  const cancelOne = (file: UploadFile): Promise<UploadCancelResult> => {
    const pending = cancellations.get(file.uid);
    if (pending) return pending;
    if (mutationDisabled.value || destroyed.value || props.transport !== 'tus') {
      return Promise.resolve({ uid: file.uid, cancelled: false, terminated: false });
    }
    abortActiveUpload(file.uid, 'cancel');
    patchFile(file.uid, { status: 'cancelling' });
    const controller = new AbortController();
    cancellationControllers.set(file.uid, controller);
    cancellationFiles.set(file.uid, file);
    const operation = (async (): Promise<UploadCancelResult> => {
      // 先登记取消任务身份，再进入可能立即完成的无资源分支。
      await Promise.resolve();
      try {
        const session = sessions.get(file.uid);
        const terminated =
          session && session.file.raw === file.raw
            ? await session.handle.terminate(controller.signal)
            : file.tusUploadUrl && props.action
              ? await terminateTusUploadResource(
                  {
                    file,
                    action: props.action,
                    tus: props.tus,
                    headers: props.headers,
                    timeout: props.timeout,
                    withCredentials: props.withCredentials,
                    uploadUrl: file.tusUploadUrl,
                  },
                  controller.signal
                )
              : false;
        controller.signal.throwIfAborted();
        const result = { uid: file.uid, cancelled: true, terminated };
        if (!destroyed.value && files.value.find(item => item.uid === file.uid)?.raw === file.raw) {
          sessions.delete(file.uid);
          const changed = patchFile(file.uid, {
            status: 'ready',
            percent: 0,
            tusUploadUrl: undefined,
            error: undefined,
          });
          if (changed) emit('cancelled', result, changed.file, changed.files);
        }
        return result;
      } catch (cause) {
        const error =
          cause instanceof ExFileUploadError
            ? cause
            : new ExFileUploadError('服务端未确认取消上传资源', {
                code: 'termination-error',
                cause,
              });
        if (
          !controller.signal.aborted &&
          !destroyed.value &&
          files.value.find(item => item.uid === file.uid)?.raw === file.raw
        ) {
          const changed = patchFile(file.uid, { status: 'error', error: error.message });
          if (changed) emit('error', error, changed.file, changed.files);
        }
        return { uid: file.uid, cancelled: false, terminated: false, error };
      } finally {
        if (cancellationControllers.get(file.uid) === controller) {
          cancellations.delete(file.uid);
          cancellationControllers.delete(file.uid);
          cancellationFiles.delete(file.uid);
        }
      }
    })();
    cancellations.set(file.uid, operation);
    return operation;
  };
  const cancel = (file?: UploadFile | string) => Promise.all(targets(file).map(cancelOne));
  const invalidateExternal = (nextFiles: readonly UploadFile[]) => {
    const current = new Map(nextFiles.map(file => [file.uid, file]));
    abortUploads(
      [...active]
        .filter(([uid, task]) => current.get(uid)?.raw !== task.file.raw)
        .map(([uid]) => uid),
      'external'
    );
    for (const [uid, session] of sessions)
      if (current.get(uid)?.raw !== session.file.raw) sessions.delete(uid);
    for (const [uid, file] of cancellationFiles) {
      if (current.get(uid)?.raw === file.raw) continue;
      cancellationControllers.get(uid)?.abort();
      cancellationControllers.delete(uid);
      cancellations.delete(uid);
      cancellationFiles.delete(uid);
    }
  };
  const abortPending = (reason: UploadAbortReason) => {
    for (const [uid, task] of active) if (task.handle.pending) abortActiveUpload(uid, reason);
  };
  const dispose = () => {
    for (const [uid, task] of active) {
      active.delete(uid);
      task.handle.abort();
    }
    sessions.clear();
    for (const controller of cancellationControllers.values()) controller.abort();
  };
  watch(
    () => props.transport,
    () => abortUploads([...active.keys()], 'external')
  );
  return {
    startUpload,
    submit,
    abort,
    pause,
    resume,
    cancel,
    abortActiveUpload,
    abortUploads,
    invalidateExternal,
    abortPending,
    dispose,
    active,
  };
}
