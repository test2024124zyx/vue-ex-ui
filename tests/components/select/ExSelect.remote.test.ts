import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type {
  ExSelectProps,
  SelectOptions,
  SelectRemoteContext,
} from '../../../src/components/select/types';

const FIRST = { value: 'first', label: '第一中心' };
const SECOND = { value: 'second', label: '第二中心' };
const DEBOUNCE = 150;

function pendingOptions() {
  let resolve!: (options: SelectOptions) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<SelectOptions>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe('Select 托管远程查询', () => {
  let wrapper: ReturnType<typeof mount<typeof ExSelect>> | undefined;

  const mountRemote = (props: Partial<ExSelectProps> = {}) => {
    wrapper = mount(ExSelect, {
      props: { remote: true, searchable: true, remoteDebounce: DEBOUNCE, ...props },
      attachTo: document.body,
    });
    return wrapper;
  };

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('打开加载空查询，管理 loading，并将结果按分组选项展示', async () => {
    const request = pendingOptions();
    const remoteLoader = vi.fn(() => request.promise);
    const control = mountRemote({ remoteLoader });
    expect(remoteLoader).not.toHaveBeenCalled();
    await control.get('input').trigger('click');
    expect(remoteLoader).toHaveBeenCalledWith('', { signal: expect.any(AbortSignal) });
    expect(control.get('input').attributes('aria-busy')).toBe('true');
    expect(document.querySelector('.ex-select__loading')).not.toBeNull();
    request.resolve([{ label: '中心', options: [FIRST, SECOND] }]);
    await flushPromises();
    expect(document.querySelector('.ex-select__group')?.textContent).toContain('中心');
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2);
    expect(control.get('input').attributes('aria-busy')).toBe('false');
  });

  it('新输入立刻取消旧请求，防抖期间不展示旧选项或接受过期响应', async () => {
    const first = pendingOptions();
    const second = pendingOptions();
    const remoteLoader = vi.fn().mockReturnValueOnce(first.promise).mockReturnValue(second.promise);
    const control = mountRemote({ remoteLoader, options: [FIRST] });
    await control.get('input').trigger('click');
    const oldSignal = remoteLoader.mock.calls[0]![1].signal as AbortSignal;
    await control.get('input').setValue('二');
    expect(oldSignal.aborted).toBe(true);
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
    first.resolve([FIRST]);
    await flushPromises();
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
    await control.get('input').setValue('第二');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader).toHaveBeenCalledTimes(2);
    expect(remoteLoader.mock.calls[1]![0]).toBe('第二');
    second.resolve([SECOND]);
    await flushPromises();
    expect(document.querySelector('[role="option"]')?.textContent).toContain(SECOND.label);
  });

  it('忽略已取消请求的失败，旧请求的 finally 不关闭新请求的 loading', async () => {
    const first = pendingOptions();
    const second = pendingOptions();
    const remoteLoader = vi.fn().mockReturnValueOnce(first.promise).mockReturnValue(second.promise);
    const control = mountRemote({ remoteLoader });
    await control.get('input').trigger('click');
    await control.get('input').setValue('第二');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    first.reject(new Error('过期失败'));
    await flushPromises();
    expect(control.emitted('remote-error')).toBeUndefined();
    expect(control.get('input').attributes('aria-busy')).toBe('true');
    second.resolve([SECOND]);
    await flushPromises();
    expect(control.get('input').attributes('aria-busy')).toBe('false');
  });

  it('失败发送原始错误，默认提示不泄露内部错误，并支持鼠标与键盘重试', async () => {
    const failure = new Error('内部地址和请求诊断');
    const remoteLoader = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue([SECOND]);
    const control = mountRemote({ remoteLoader });
    await control.get('input').trigger('click');
    await flushPromises();
    expect(control.emitted('remote-error')).toEqual([[failure, '']]);
    const retry = document.querySelector<HTMLButtonElement>('.ex-select__retry')!;
    expect(retry).not.toBeNull();
    expect(retry.closest('[role="listbox"]')).toBeNull();
    expect(document.querySelector('.ex-select__remote-error')?.textContent).not.toContain(
      failure.message
    );
    retry.click();
    await flushPromises();
    expect(remoteLoader).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[role="option"]')?.textContent).toContain(SECOND.label);
    expect(document.querySelector('.ex-select__remote-error')).toBeNull();
  });

  it('错误插槽收到错误与同查询的重试入口', async () => {
    const failure = { code: 'UNAVAILABLE' };
    const remoteLoader = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue([FIRST]);
    wrapper = mount(ExSelect, {
      props: { remote: true, searchable: true, remoteLoader },
      slots: {
        error: ({ error, retry }) =>
          h('button', { class: 'custom-retry', onClick: retry }, (error as typeof failure).code),
      },
    });
    await wrapper.get('input').trigger('click');
    await flushPromises();
    const retry = document.querySelector<HTMLButtonElement>('.custom-retry')!;
    expect(retry.textContent).toBe('UNAVAILABLE');
    retry.click();
    await flushPromises();
    expect(remoteLoader).toHaveBeenCalledTimes(2);
  });

  it.each(['Escape', 'Tab'])('%s 关闭取消防抖和请求，重开重新查询', async key => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const control = mountRemote({ remoteLoader });
    await control.get('input').trigger('click');
    const signal = remoteLoader.mock.calls[0]![1]?.signal;
    await control.get('input').setValue('第二');
    await control.get('input').trigger('keydown', { key });
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(signal?.aborted).toBe(true);
    expect(remoteLoader).toHaveBeenCalledTimes(1);
    request.resolve([FIRST]);
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    await control.get('input').trigger('click');
    expect(remoteLoader).toHaveBeenCalledTimes(2);
    expect(remoteLoader.mock.calls[1]![0]).toBe('');
  });

  it.each(['disabled', 'readonly'] as const)('%s 取消当前请求并阻止重试', async flag => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const control = mountRemote({ remoteLoader });
    await control.get('input').trigger('click');
    await control.setProps({ [flag]: true });
    expect(remoteLoader.mock.calls[0]![1].signal.aborted).toBe(true);
    control.vm.retryRemote();
    expect(remoteLoader).toHaveBeenCalledTimes(1);
    request.resolve([FIRST]);
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
  });

  it('卸载取消当前请求，不发送迟到的失败事件', async () => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const control = mountRemote({ remoteLoader });
    await control.get('input').trigger('click');
    control.unmount();
    wrapper = undefined;
    expect(remoteLoader.mock.calls[0]![1].signal.aborted).toBe(true);
    request.reject(new Error('卸载后失败'));
    await flushPromises();
    expect(control.emitted('remote-error')).toBeUndefined();
  });

  it('输入法合成期间取消旧请求，仅在完整提交后查询一次', async () => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const control = mountRemote({ remoteLoader });
    const input = control.get('input');
    await input.trigger('click');
    await input.trigger('compositionstart');
    await input.setValue('zhong');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader).toHaveBeenCalledTimes(1);
    expect(remoteLoader.mock.calls[0]![1].signal.aborted).toBe(true);
    input.element.value = '中心';
    await input.trigger('compositionend');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader).toHaveBeenCalledTimes(2);
    expect(remoteLoader.mock.calls[1]![0]).toBe('中心');
  });

  it('远程结果替换后保留受控值的标签，组件不擅自修改 modelValue', async () => {
    const remoteLoader = vi.fn().mockResolvedValue([SECOND]);
    const control = mountRemote({
      remoteLoader,
      modelValue: 'first',
      options: [FIRST],
      clearable: true,
    });
    await control.get('input').trigger('click');
    await flushPromises();
    await control.get('input').trigger('keydown', { key: 'Escape' });
    expect(control.get('input').attributes('placeholder')).toBe(FIRST.label);
    expect(control.get('.ex-select__clear')).toBeTruthy();
    expect(control.emitted('update:modelValue')).toBeUndefined();
  });

  it('多选查询后选中即清空查询并重新加载，保留不同查询下的选中标签', async () => {
    const remoteLoader = vi.fn().mockResolvedValueOnce([FIRST]).mockResolvedValue([SECOND]);
    const control = mountRemote({ remoteLoader, multiple: true, modelValue: [] });
    await control.get('input').trigger('click');
    await flushPromises();
    document.querySelector<HTMLElement>('[role="option"]')!.click();
    await control.setProps({ modelValue: ['first'] });
    await flushPromises();
    expect(control.get('.ex-select__tag-label').text()).toBe(FIRST.label);
    expect(remoteLoader).toHaveBeenCalledTimes(2);
    expect(remoteLoader.mock.calls[1]![0]).toBe('');
    expect(document.querySelector('[role="option"]')?.textContent).toContain(SECOND.label);
  });

  it('虚拟分组选项仍可使用 End 与 Enter 选择远程最后一项', async () => {
    const options = Array.from({ length: 200 }, (_, value) => ({ value, label: `选项 ${value}` }));
    const control = mountRemote({
      virtual: true,
      remoteLoader: async () => [{ label: '全部', options }],
    });
    await control.get('input').trigger('click');
    await flushPromises();
    expect(document.querySelectorAll('[role="option"]').length).toBeLessThan(options.length);
    await control.get('input').trigger('keydown', { key: 'End' });
    await control.get('input').trigger('keydown', { key: 'Enter' });
    expect(control.emitted('update:modelValue')?.[0]).toEqual([199]);
  });

  it('传统 remoteMethod 保留单参数回调，options 与 loading 继续由父组件控制', async () => {
    const remoteMethod = vi.fn();
    const control = mountRemote({ remoteMethod, options: [FIRST] });
    await control.get('input').trigger('click');
    expect(remoteMethod).not.toHaveBeenCalled();
    await control.get('input').setValue('不存在');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteMethod).toHaveBeenCalledWith('不存在');
    expect(document.querySelector('[role="option"]')?.textContent).toContain(FIRST.label);
    await control.setProps({ loading: true, options: [] });
    expect(document.querySelector('.ex-select__loading')).not.toBeNull();
  });

  it('同时配置时 loader 优先，remote=false 时恢复本地列表且不发请求', async () => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const remoteMethod = vi.fn();
    const control = mountRemote({ remoteLoader, remoteMethod, options: [FIRST] });
    await control.get('input').trigger('click');
    await control.setProps({ remote: false });
    expect(remoteLoader.mock.calls[0]![1].signal.aborted).toBe(true);
    request.resolve([SECOND]);
    await flushPromises();
    expect(document.querySelector('[role="option"]')?.textContent).toContain(FIRST.label);
    expect(remoteMethod).not.toHaveBeenCalled();
    await nextTick();
  });

  it('直接在关闭的输入框输入只发出一次防抖查询', async () => {
    const remoteLoader = vi.fn().mockResolvedValue([FIRST]);
    const control = mountRemote({ remoteLoader });
    await control.get('input').setValue('中心');
    expect(remoteLoader).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader).toHaveBeenCalledTimes(1);
    expect(remoteLoader.mock.calls[0]![0]).toBe('中心');
  });

  it('删除搜索词后仍请求空查询，并区分空结果与正在加载', async () => {
    const remoteLoader = vi.fn().mockResolvedValue([]);
    const control = mountRemote({ remoteLoader });
    await control.get('input').setValue('中心');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(document.querySelector('.ex-select__empty')).not.toBeNull();
    await control.get('input').setValue('');
    expect(document.querySelector('.ex-select__empty')).toBeNull();
    expect(document.querySelector('.ex-select__loading')).not.toBeNull();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader.mock.calls.map(call => call[0])).toEqual(['中心', '']);
  });

  it.each([null, undefined, false])('即使拒绝原因为 %s 也保留可恢复错误状态', async error => {
    const control = mountRemote({ remoteLoader: async () => Promise.reject(error) });
    await control.get('input').trigger('click');
    await flushPromises();
    expect(control.emitted('remote-error')).toEqual([[error, '']]);
    expect(document.querySelector('.ex-select__retry')).not.toBeNull();
  });

  it('同步抛出的请求错误也进入相同恢复路径，Enter 会重试原查询', async () => {
    const failure = new Error('连接配置错误');
    const remoteLoader = vi
      .fn()
      .mockImplementationOnce(() => {
        throw failure;
      })
      .mockResolvedValue([FIRST]);
    const control = mountRemote({ remoteLoader });
    await control.get('input').setValue('中心');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(control.emitted('remote-error')).toEqual([[failure, '中心']]);
    await control.get('input').trigger('keydown', { key: 'Enter' });
    await flushPromises();
    expect(remoteLoader.mock.calls.map(call => call[0])).toEqual(['中心', '中心']);
    expect(document.querySelector('.ex-select__remote-error')).toBeNull();
  });

  it('错误重试按钮支持 Tab、Shift+Tab 与 Escape，焦点不会留在卸载的按钮', async () => {
    const control = mountRemote({ remoteLoader: async () => Promise.reject(new Error('失败')) });
    const input = control.get('input');
    await input.trigger('click');
    await flushPromises();
    const retry = document.querySelector<HTMLButtonElement>('.ex-select__retry')!;
    await input.trigger('keydown', { key: 'Tab' });
    expect(document.activeElement).toBe(retry);
    retry.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    );
    expect(document.activeElement).toBe(input.element);
    expect(document.querySelector('.ex-select__dropdown')).not.toBeNull();
    await input.trigger('keydown', { key: 'Tab' });
    retry.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(input.element);
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
  });

  it('运行时更换 loader 使旧请求失效并加载当前查询', async () => {
    const first = pendingOptions();
    const firstLoader = vi.fn((_query: string, _context: SelectRemoteContext) => first.promise);
    const secondLoader = vi.fn().mockResolvedValue([SECOND]);
    const control = mountRemote({ remoteLoader: firstLoader });
    await control.get('input').setValue('中心');
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    await control.setProps({ remoteLoader: secondLoader });
    expect(firstLoader.mock.calls[0]![1].signal.aborted).toBe(true);
    expect(secondLoader.mock.calls[0]![0]).toBe('中心');
    first.resolve([FIRST]);
    await flushPromises();
    expect(document.querySelector('[role="option"]')?.textContent).toContain(SECOND.label);
  });

  it('运行时修改防抖时间重新安排待执行查询，不丢失最近输入', async () => {
    const remoteLoader = vi.fn().mockResolvedValue([FIRST]);
    const control = mountRemote({ remoteLoader });
    await control.get('input').setValue('中心');
    await control.setProps({ remoteDebounce: DEBOUNCE * 2 });
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(DEBOUNCE);
    expect(remoteLoader).toHaveBeenCalledTimes(1);
    expect(remoteLoader.mock.calls[0]![0]).toBe('中心');
  });

  it('请求完成后仍尊重父组件 loading；清空会取消请求而不发额外空查询', async () => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const control = mountRemote({
      remoteLoader,
      loading: true,
      modelValue: 'first',
      options: [FIRST],
      clearable: true,
    });
    await control.get('input').trigger('click');
    request.resolve([SECOND]);
    await flushPromises();
    expect(document.querySelector('.ex-select__loading')).not.toBeNull();
    await control.setProps({ loading: false });
    expect(document.querySelector('.ex-select__loading')).toBeNull();
    await control.get('.ex-select__clear').trigger('click');
    expect(control.emitted('update:modelValue')).toEqual([[null]]);
    expect(remoteLoader).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
  });

  it('外部点击关闭会取消正在执行的请求，并丢弃迟到结果', async () => {
    const request = pendingOptions();
    const remoteLoader = vi.fn((_query: string, _context: SelectRemoteContext) => request.promise);
    const control = mountRemote({ remoteLoader });
    await control.get('input').trigger('click');
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await nextTick();
    expect(remoteLoader.mock.calls[0]![1].signal.aborted).toBe(true);
    request.resolve([FIRST]);
    await flushPromises();
    expect(document.querySelector('.ex-select__dropdown')).toBeNull();
  });

  it('非搜索远程选择器打开即加载并在触发器声明 busy', async () => {
    const request = pendingOptions();
    const control = mountRemote({ remoteLoader: () => request.promise, searchable: false });
    await control.get('.ex-select__trigger').trigger('click');
    expect(control.get('.ex-select__trigger').attributes('aria-busy')).toBe('true');
    request.resolve([FIRST]);
    await flushPromises();
    expect(control.get('.ex-select__trigger').attributes('aria-busy')).toBe('false');
  });
});
