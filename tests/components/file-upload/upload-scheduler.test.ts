import { describe, expect, it } from 'vitest';
import { createUploadScheduler } from '../../../src/components/file-upload/upload-scheduler';
import type {
  UploadRequestHandle,
  UploadTransportResult,
} from '../../../src/components/file-upload/upload-request';

/** 可手动结束的真实异步任务，验证调度器的并发与取消契约。 */
const createTask = () => {
  let finish!: (result: UploadTransportResult) => void;
  let completed = false;
  const promise = new Promise<UploadTransportResult>(resolve => {
    finish = result => {
      completed = true;
      resolve(result);
    };
  });
  const handle: UploadRequestHandle = {
    promise,
    pending: false,
    abort: () => {
      if (completed) return false;
      finish({ outcome: 'aborted' });
      return true;
    },
  };
  return { handle, finish };
};

describe('上传文件并发调度', () => {
  it('按加入顺序填充并发槽位，完成后才启动后续文件', async () => {
    const scheduler = createUploadScheduler(() => 2);
    const tasks = Array.from({ length: 4 }, createTask);
    const started: number[] = [];
    const handles = tasks.map((task, index) =>
      scheduler.enqueue(() => {
        started.push(index);
        return task.handle;
      })
    );
    await Promise.resolve();
    expect(started).toEqual([0, 1]);
    expect(handles[2]!.pending).toBe(true);
    tasks[1]!.finish({ outcome: 'success', response: '第二个完成' });
    await handles[1]!.promise;
    await Promise.resolve();
    expect(started).toEqual([0, 1, 2]);
    handles.forEach(handle => handle.abort());
    await Promise.all(handles.map(handle => handle.promise));
  });

  it('取消排队文件立即兑现结果且绝不创建网络任务', async () => {
    const scheduler = createUploadScheduler(() => 1);
    const task = createTask();
    const active = scheduler.enqueue(() => task.handle);
    let created = false;
    const queued = scheduler.enqueue(() => {
      created = true;
      return createTask().handle;
    });
    expect(queued.abort()).toBe(true);
    expect(queued.abort()).toBe(false);
    await expect(queued.promise).resolves.toEqual({ outcome: 'aborted' });
    active.abort();
    await active.promise;
    expect(created).toBe(false);
  });

  it('动态提高并发立即排空可运行队列，降低并发不截断活动请求', async () => {
    let concurrency = 1;
    const scheduler = createUploadScheduler(() => concurrency);
    const started: number[] = [];
    const handles = [0, 1, 2].map(index =>
      scheduler.enqueue(() => {
        started.push(index);
        return createTask().handle;
      })
    );
    await Promise.resolve();
    expect(started).toEqual([0]);
    concurrency = 2;
    scheduler.update();
    await Promise.resolve();
    expect(started).toEqual([0, 1]);
    concurrency = 1;
    handles[0]!.abort();
    await handles[0]!.promise;
    await Promise.resolve();
    expect(started).toEqual([0, 1]);
    handles[1]!.abort();
    await handles[1]!.promise;
    await Promise.resolve();
    expect(started).toEqual([0, 1, 2]);
    handles[2]!.abort();
  });

  it('任务工厂同步失败不占住槽位，队列继续执行', async () => {
    const scheduler = createUploadScheduler(() => 1);
    const failed = scheduler.enqueue(() => {
      throw new Error('无法启动');
    });
    const next = scheduler.enqueue(() => createTask().handle);
    await expect(failed.promise).resolves.toMatchObject({
      outcome: 'error',
      error: { code: 'request-error' },
    });
    await Promise.resolve();
    expect(next.pending).toBe(false);
    next.abort();
  });

  it.each([0, -1, Number.NaN, 0.5])('非法并发 %s 回退到可运行的默认值', async concurrency => {
    const scheduler = createUploadScheduler(() => concurrency);
    const handle = scheduler.enqueue(() => createTask().handle);
    await Promise.resolve();
    expect(handle.pending).toBe(false);
    handle.abort();
  });
});
