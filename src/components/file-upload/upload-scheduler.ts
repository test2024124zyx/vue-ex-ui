import { ExFileUploadError } from './errors';
import type { UploadRequestHandle, UploadTransportResult } from './upload-request';

export const DEFAULT_UPLOAD_CONCURRENCY = 3;

interface ScheduledUpload {
  create: () => UploadRequestHandle;
  handle?: UploadRequestHandle;
  finished: boolean;
  settle: (result: UploadTransportResult) => void;
}

/** 文件级并发独立于协议；单个 tus 文件仍按服务器确认的偏移顺序上传。 */
export function createUploadScheduler(getConcurrency: () => number | undefined) {
  const queue: ScheduledUpload[] = [];
  let active = 0;
  let scheduled = false;
  const capacity = () => {
    const value = getConcurrency();
    return value === Number.POSITIVE_INFINITY || (Number.isSafeInteger(value) && value! > 0)
      ? value!
      : DEFAULT_UPLOAD_CONCURRENCY;
  };
  const errorResult = (cause: unknown): UploadTransportResult => ({
    outcome: 'error',
    error:
      cause instanceof ExFileUploadError
        ? cause
        : new ExFileUploadError('无法启动上传任务', { code: 'request-error', cause }),
  });
  const update = () => {
    if (scheduled) return;
    scheduled = true;
    void Promise.resolve().then(() => {
      scheduled = false;
      while (active < capacity() && queue.length) {
        const task = queue.shift()!;
        if (task.finished) continue;
        active += 1;
        const finish = (result: UploadTransportResult) => {
          if (task.finished) return;
          task.finished = true;
          active -= 1;
          task.settle(result);
          update();
        };
        try {
          task.handle = task.create();
          void task.handle.promise.then(finish, cause => finish(errorResult(cause)));
        } catch (cause) {
          finish(errorResult(cause));
        }
      }
    });
  };
  const enqueue = (create: () => UploadRequestHandle): UploadRequestHandle => {
    let settle!: (result: UploadTransportResult) => void;
    const promise = new Promise<UploadTransportResult>(resolve => {
      settle = resolve;
    });
    const task: ScheduledUpload = { create, settle, finished: false };
    queue.push(task);
    update();
    return {
      promise,
      get pending() {
        return !task.finished && (!task.handle || task.handle.pending);
      },
      abort() {
        if (task.finished) return false;
        if (task.handle) return task.handle.abort();
        task.finished = true;
        queue.splice(queue.indexOf(task), 1);
        task.settle({ outcome: 'aborted' });
        return true;
      },
    };
  };
  return { enqueue, update };
}
