import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import {
  resolveNotificationConfig,
  resolveNotificationOptions,
} from '../../../src/components/notification/notification-utils';
import type {
  NotificationGlobalConfig,
  NotificationOptions,
} from '../../../src/components/notification/types';

const config: NotificationGlobalConfig = {
  duration: 4500,
  offset: 16,
  zIndex: 2000,
  maxCount: 10,
  showIcon: true,
  closable: true,
  position: 'top-right',
};

describe('通知输入的运行时边界', () => {
  it.each([
    null,
    [],
    { title: 1 },
    { content: {} },
    { title: '   ' },
    { title: '消息', id: '' },
    { title: '消息', customClass: 2 },
    { title: '消息', customStyle: [] },
    { title: '消息', onClick: true },
    { title: '消息', onClose: true },
    { title: '消息', showIcon: 'true' },
    { title: '消息', zIndex: 1.5 },
    { title: '消息', type: 'unknown' },
    { title: '消息', unsafe: true },
  ])('拒绝非法配置 %j，避免不可靠状态进入通知队列', value => {
    expect(() =>
      resolveNotificationOptions(value as unknown as NotificationOptions, config)
    ).toThrow();
  });

  it('VNode 不能进入 HTML 字符串通道，快捷类型不接受冲突类型', () => {
    expect(() =>
      resolveNotificationOptions(
        { content: h('strong', '内容'), dangerouslyUseHTMLString: true },
        config
      )
    ).toThrow();
    expect(() =>
      resolveNotificationOptions({ title: '消息', type: 'error' }, config, 'success')
    ).toThrow();
    const options = resolveNotificationOptions(
      { id: ' task ', content: '详情', customStyle: { color: 'red' } },
      config
    );
    expect(options).toMatchObject({
      id: 'task',
      title: '',
      content: '详情',
      customStyle: { color: 'red' },
    });
  });

  it.each([null, [], { zIndex: 1.5 }, { maxCount: 0 }, { position: 'center' }])(
    '错误全局配置 %j 不改变原配置',
    value => {
      const previous = { ...config };
      expect(() =>
        resolveNotificationConfig(value as unknown as NotificationGlobalConfig, config)
      ).toThrow();
      expect(config).toEqual(previous);
    }
  );
});
