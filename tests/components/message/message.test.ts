import { flushPromises } from '@vue/test-utils';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExMessage, message } from '@/index';
import type { MessageGlobalConfig, MessageOptions } from '../../../src/components/message/types';

const defaultConfig: MessageGlobalConfig = {
  duration: 3000,
  offset: 20,
  zIndex: 2000,
  maxCount: 5,
  showIcon: true,
  closable: false,
  grouping: false,
};

const flush = async (): Promise<void> => {
  await nextTick();
  await flushPromises();
};

const finishMotion = async (): Promise<void> => {
  await vi.runAllTimersAsync();
  await flush();
};

const messages = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('.ex-message'));

describe('Message 服务', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    message.closeAll();
    message.config(defaultConfig);
  });

  afterEach(async () => {
    message.closeAll();
    await finishMotion();
    message.config(defaultConfig);
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('主函数与类型快捷方法创建独立实例并兑现对应状态', async () => {
    const info = message({ content: '信息', duration: 0 });
    const success = message.success({ content: '成功', duration: 0 });
    await flush();

    expect(info.id).not.toBe(success.id);
    expect(messages()).toHaveLength(2);
    expect(messages()[0].textContent).toContain('信息');
    expect(messages()[0].classList).toContain('ex-message--info');
    expect(messages()[1].classList).toContain('ex-message--success');
  });

  it('loading 默认保持显示，显式 duration 仍可覆盖', async () => {
    message.loading('处理中');
    const timed = message.loading({ content: '短任务', duration: 1000 });
    await flush();

    vi.advanceTimersByTime(1000);
    await flush();
    expect(messages().some(element => element.textContent?.includes('处理中'))).toBe(true);
    expect(message.close(timed.id)).toBe(false);
  });

  it('实例关闭与按 ID 关闭共享幂等生命周期，回调只执行一次', async () => {
    const onClose = vi.fn();
    const instance = message.info({ content: '待关闭', duration: 0, onClose });
    await flush();

    expect(message.close(instance.id)).toBe(true);
    instance.close();
    expect(message.close(instance.id)).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);

    await finishMotion();
    expect(document.querySelector('.ex-message-container')).toBeNull();
  });

  it('自动计时关闭后释放宿主并执行回调', async () => {
    const onClose = vi.fn();
    message.info({ content: '自动关闭', duration: 1000, onClose });
    await flush();

    vi.advanceTimersByTime(999);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    await flush();
    expect(onClose).toHaveBeenCalledTimes(1);

    await finishMotion();
    expect(document.querySelector('.ex-message-wrapper')).toBeNull();
  });

  it('单条与全局 grouping 只合并同类型同内容的活动消息', async () => {
    const first = message.info({ content: '重复', duration: 0, grouping: true });
    const second = message.info({ content: '重复', duration: 0, grouping: true });
    const differentType = message.warning({ content: '重复', duration: 0, grouping: true });
    await flush();

    expect(second.id).toBe(first.id);
    expect(differentType.id).not.toBe(first.id);
    expect(messages()).toHaveLength(2);

    message.config({ grouping: true });
    const globalFirst = message.success({ content: '全局合并', duration: 0 });
    const globalSecond = message.success({ content: '全局合并', duration: 0 });
    expect(globalSecond.id).toBe(globalFirst.id);
  });

  it('maxCount 严格淘汰最旧消息并执行其关闭回调', async () => {
    const firstClose = vi.fn();
    message.config({ maxCount: 2 });
    message.info({ content: '第一条', duration: 0, onClose: firstClose });
    message.info({ content: '第二条', duration: 0 });
    message.info({ content: '第三条', duration: 0 });
    await flush();

    expect(messages()).toHaveLength(2);
    expect(document.body.textContent).not.toContain('第一条');
    expect(document.body.textContent).toContain('第二条');
    expect(document.body.textContent).toContain('第三条');
    expect(firstClose).toHaveBeenCalledTimes(1);
  });

  it('降低 maxCount 会立即收敛现有队列', async () => {
    const closed = [vi.fn(), vi.fn(), vi.fn()];
    closed.forEach((onClose, index) => {
      message.info({ content: `消息${index}`, duration: 0, onClose });
    });
    await flush();

    message.config({ maxCount: 1 });
    expect(messages()).toHaveLength(1);
    expect(closed[0]).toHaveBeenCalledTimes(1);
    expect(closed[1]).toHaveBeenCalledTimes(1);
    expect(closed[2]).not.toHaveBeenCalled();
  });

  it('全局配置真实控制容器、默认计时与组件默认值', async () => {
    message.config({
      duration: 1000,
      offset: 36,
      zIndex: 4100,
      showIcon: false,
      closable: true,
    });
    message.info('配置消息');
    await flush();

    const container = document.querySelector<HTMLElement>('.ex-message-container')!;
    expect(container.style.getPropertyValue('--ex-message-offset')).toBe('36px');
    expect(container.style.getPropertyValue('--ex-message-z-index')).toBe('4100');
    expect(document.querySelector('.ex-message__icon')).toBeNull();
    expect(document.querySelector('.ex-message__close')?.tagName).toBe('BUTTON');

    vi.advanceTimersByTime(1000);
    await flush();
    await finishMotion();
    expect(messages()).toHaveLength(0);
  });

  it('服务使用原生 class 与 style 定制单条消息', async () => {
    message.info({
      content: '自定义',
      duration: 0,
      class: ['service-message', { active: true }],
      style: { opacity: 0.8 },
    });
    await flush();

    const root = messages()[0];
    expect(root.classList).toContain('service-message');
    expect(root.classList).toContain('active');
    expect(root.style.opacity).toBe('0.8');
  });

  it('服务宿主被外部移除后会清理失效记录并重新建立单一宿主', async () => {
    const staleClose = vi.fn();
    message.info({ content: '旧宿主', duration: 0, onClose: staleClose });
    await flush();
    document.querySelector('.ex-message-container')?.remove();

    message.info({ content: '新宿主', duration: 0 });
    await flush();
    expect(document.querySelectorAll('.ex-message-container')).toHaveLength(1);
    expect(messages()).toHaveLength(1);
    expect(messages()[0].textContent).toContain('新宿主');
    expect(staleClose).toHaveBeenCalledTimes(1);
  });

  it('非法配置显式报错且不会污染此前有效配置', async () => {
    message.config({ offset: 24, maxCount: 3 });

    expect(() => message.config({ duration: Number.NaN })).toThrow(TypeError);
    expect(() => message.config({ duration: -1 })).toThrow(RangeError);
    expect(() => message.config({ offset: Number.POSITIVE_INFINITY })).toThrow(TypeError);
    expect(() => message.config({ offset: -1 })).toThrow(RangeError);
    expect(() => message.config({ zIndex: -1 })).toThrow(RangeError);
    expect(() => message.config({ maxCount: 0 })).toThrow(RangeError);
    expect(() => message.config({ maxCount: 1.5 })).toThrow(RangeError);
    expect(() => message.config({ showIcon: 'yes' as unknown as boolean })).toThrow(TypeError);
    expect(() =>
      (message.config as (options: Record<string, unknown>) => void)({ position: 'bottom' })
    ).toThrow(TypeError);
    expect(() => (message.config as (options: unknown) => void)(null)).toThrow(TypeError);

    message.info({ content: '仍使用旧配置', duration: 0 });
    await flush();
    const container = document.querySelector<HTMLElement>('.ex-message-container')!;
    expect(container.style.getPropertyValue('--ex-message-offset')).toBe('24px');
  });

  it.each([
    'id',
    'offset',
    'zIndex',
    'customClass',
    'customStyle',
    'closeOnRouteChange',
    'position',
  ])('已删除的 %s 选项会被明确拒绝而不是静默伪装生效', key => {
    expect(() =>
      message({ content: '旧选项', duration: 0, [key]: 'legacy' } as unknown as MessageOptions)
    ).toThrow(TypeError);
    expect(document.querySelector('.ex-message')).toBeNull();
  });

  it('拒绝空内容、VNode 伪内容与非法布尔选项', () => {
    expect(() => message('   ')).toThrow(TypeError);
    expect(() => message(42 as unknown as MessageOptions)).toThrow(TypeError);
    expect(() => message(h('strong', 'VNode') as unknown as MessageOptions)).toThrow(TypeError);
    expect(() => message({ content: '消息', type: 'unknown' as never })).toThrow(TypeError);
    expect(() => message({ content: '消息', duration: -1 })).toThrow(RangeError);
    expect(() =>
      message({ content: '消息', showIcon: 'yes' } as unknown as MessageOptions)
    ).toThrow(TypeError);
    expect(() =>
      message({ content: '消息', onClose: 'close' } as unknown as MessageOptions)
    ).toThrow(TypeError);
    expect(() =>
      message.info({ content: '消息', type: 'error' } as unknown as MessageOptions)
    ).toThrow(TypeError);
  });

  it('HTML 服务内容沿用组件消毒边界', async () => {
    message.info({
      content: '<strong>安全</strong><img src="x" onerror="bad()"><script>bad()</script>',
      dangerouslyUseHTMLString: true,
      duration: 0,
    });
    await flush();

    const content = document.querySelector<HTMLElement>('.ex-message__content')!;
    expect(content.querySelector('strong')?.textContent).toBe('安全');
    expect(content.innerHTML).not.toContain('onerror');
    expect(content.innerHTML).not.toContain('<script');
  });

  it('closeAll 立即释放全部记录并逐条执行一次回调', async () => {
    const callbacks = [vi.fn(), vi.fn(), vi.fn()];
    callbacks.forEach((onClose, index) => {
      message.info({ content: `关闭${index}`, duration: 0, onClose });
    });
    await flush();

    message.closeAll();
    message.closeAll();
    expect(document.querySelector('.ex-message-container')).toBeNull();
    callbacks.forEach(callback => expect(callback).toHaveBeenCalledTimes(1));
  });

  it('onClose 异常不会阻断 closeAll 清理其他消息', async () => {
    const secondClose = vi.fn();
    message.info({
      content: '异常回调',
      duration: 0,
      onClose: () => {
        throw new Error('回调失败');
      },
    });
    message.info({ content: '正常回调', duration: 0, onClose: secondClose });
    await flush();

    expect(() => message.closeAll()).toThrow('回调失败');
    expect(secondClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.ex-message-container')).toBeNull();
  });

  it('无 DOM 环境会抛出明确错误且不创建伪实例', () => {
    vi.stubGlobal('document', undefined);
    try {
      expect(() => message.info('SSR 消息')).toThrow(/浏览器环境/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('组件独立安装会注册同一个 $message 服务', () => {
    const app = createApp(defineComponent(() => () => h('div')));
    app.use(ExMessage);
    expect(app.component('ExMessage')).toBe(ExMessage);
    expect(app.config.globalProperties.$message).toBe(message);
  });

  it('服务方法可安全解构调用', async () => {
    const { info, success, close, closeAll } = message;
    const first = info({ content: '信息', duration: 0 });
    success({ content: '成功', duration: 0 });
    await flush();
    expect(messages()).toHaveLength(2);
    expect(close(first.id)).toBe(true);
    closeAll();
    expect(messages()).toHaveLength(0);
  });
});
