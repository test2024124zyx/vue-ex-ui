import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref, type EmitFn } from 'vue';
import ExCard from '../../src/components/card/ExCard.vue';
import ExPanel from '../../src/components/panel/ExPanel.vue';
import ExList from '../../src/components/list/ExList.vue';
import ExTimelineItem from '../../src/components/timeline/ExTimelineItem.vue';
import ExNotification from '../../src/components/notification/ExNotification.vue';
import type { ExCardEmits } from '../../src/components/card/types';
import type { ExNotificationEmits } from '../../src/components/notification/types';
import ListenerParameterTypes from './fixtures/ListenerParameterTypes.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('稳定模板中的动态点击监听', () => {
  it.each([
    ['Card', 'ExCard', '.ex-card__primary-action', ''],
    ['Panel', 'ExPanel', '.ex-panel[tabindex="0"]', 'hoverable'],
    ['Notification', 'ExNotification', '.ex-notification[tabindex="0"]', ':duration="0"'],
  ])('%s 普通监听增删与替换会同步交互语义', async (_name, tag, selector, attributes) => {
    const enabled = ref(false);
    const click = ref(vi.fn());
    const wrapper = mount(
      defineComponent({
        components: { ExCard, ExPanel, ExNotification },
        setup: () => ({ enabled, click }),
        template: `<${tag} ${attributes} :onClick="enabled ? click : undefined">内容</${tag}>`,
      })
    );
    wrappers.push(wrapper);
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(false);
    enabled.value = true;
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(true);
    await wrapper.get(selector).trigger('click');
    expect(click.value).toHaveBeenCalledTimes(1);
    expect(click.value.mock.calls[0]).toEqual(
      _name === 'Notification' ? [] : [expect.any(MouseEvent)]
    );
    const previous = click.value;
    click.value = vi.fn();
    await nextTick();
    await wrapper.get(selector).trigger('click');
    expect(previous).toHaveBeenCalledTimes(1);
    expect(click.value).toHaveBeenCalledTimes(1);
    enabled.value = false;
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(false);
  });

  it.each([
    ['Card', 'ExCard', '.ex-card__primary-action', ''],
    ['Panel', 'ExPanel', '.ex-panel[tabindex="0"]', 'hoverable'],
    ['Notification', 'ExNotification', '.ex-notification[tabindex="0"]', ':duration="0"'],
  ])('%s 仅 once 监听也支持动态交互且单次执行', async (_name, tag, selector, attributes) => {
    const enabled = ref(false);
    const click = vi.fn();
    const wrapper = mount(
      defineComponent({
        components: { ExCard, ExPanel, ExNotification },
        setup: () => ({ enabled, click }),
        template: `<${tag} ${attributes} :onClickOnce="enabled ? click : undefined">内容</${tag}>`,
      })
    );
    wrappers.push(wrapper);
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(false);
    enabled.value = true;
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(true);
    await wrapper.get(selector).trigger('click');
    await wrapper.get(selector).trigger('click');
    expect(click).toHaveBeenCalledTimes(1);
    enabled.value = false;
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(false);
  });

  it.each([
    ['List', 'ExList', '.ex-list__item-primary-action', 'item-click', ':data="items"'],
    ['TimelineItem', 'ExTimelineItem', '.ex-timeline-item__primary-action', 'click', ''],
  ])('%s 显式 clickable 与动态监听保持独立', async (_name, tag, selector, event, attributes) => {
    const enabled = ref(false);
    const click = vi.fn();
    const wrapper = mount(
      defineComponent({
        components: { ExList, ExTimelineItem },
        setup: () => ({ enabled, click, items: [{ title: '记录' }] }),
        template: `<${tag} ${attributes} clickable v-on="enabled ? { '${event}': click } : {}">内容</${tag}>`,
      })
    );
    wrappers.push(wrapper);
    expect(wrapper.find(selector).exists()).toBe(true);
    enabled.value = true;
    await nextTick();
    await wrapper.get(selector).trigger('click');
    expect(click).toHaveBeenCalledTimes(1);
    enabled.value = false;
    await nextTick();
    expect(wrapper.find(selector).exists()).toBe(true);
    await wrapper.get(selector).trigger('click');
    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['Card', 'ExCard', '.ex-card__primary-action', ''],
    ['Notification', 'ExNotification', '.ex-notification[tabindex="0"]', ':duration="0"'],
  ])('%s 保留普通与 once 混合监听的组件生命周期语义', async (_name, tag, selector, attributes) => {
    const onceEnabled = ref(true);
    const click = vi.fn();
    const once = vi.fn();
    const wrapper = mount(
      defineComponent({
        components: { ExCard, ExNotification },
        setup: () => ({ click, once, onceEnabled }),
        template: `<${tag} ${attributes} @click="click" :onClickOnce="onceEnabled ? once : undefined">内容</${tag}>`,
      })
    );
    wrappers.push(wrapper);
    await nextTick();
    await wrapper.get(selector).trigger('click');
    await wrapper.get(selector).trigger('click');
    expect(click).toHaveBeenCalledTimes(2);
    expect(once).toHaveBeenCalledTimes(1);
    onceEnabled.value = false;
    await nextTick();
    onceEnabled.value = true;
    await nextTick();
    await wrapper.get(selector).trigger('click');
    expect(click).toHaveBeenCalledTimes(3);
    expect(once).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['Card', 'ExCard', '.ex-card__primary-action', ''],
    ['Notification', 'ExNotification', '.ex-notification[tabindex="0"]', ':duration="0"'],
  ])(
    '%s 数组监听的异常仍交给 Vue，后续监听继续且没有 attrs 重复分发',
    async (_name, tag, selector, attributes) => {
      const failure = new Error('点击失败');
      const errorHandler = vi.fn();
      const afterFailure = vi.fn();
      const listeners = [
        () => {
          throw failure;
        },
        afterFailure,
      ];
      const wrapper = mount(
        defineComponent({
          components: { ExCard, ExNotification },
          setup: () => ({ listeners }),
          template: `<${tag} ${attributes} :onClick="listeners">内容</${tag}>`,
        }),
        { global: { config: { errorHandler } } }
      );
      wrappers.push(wrapper);
      await nextTick();
      await wrapper.get(selector).trigger('click');
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler.mock.calls[0]?.[0]).toBe(failure);
      expect(afterFailure).toHaveBeenCalledTimes(1);
    }
  );

  it('组件实例和现有事件接口保留点击参数类型', () => {
    type CardInstance = InstanceType<typeof ExCard>;
    type NotificationInstance = InstanceType<typeof ExNotification>;
    type CardClick = Exclude<NonNullable<CardInstance['$props']['onClick']>, unknown[]>;
    type NotificationClick = Exclude<
      NonNullable<NotificationInstance['$props']['onClick']>,
      unknown[]
    >;
    expectTypeOf<Parameters<CardClick>>().toEqualTypeOf<ExCardEmits['click']>();
    expectTypeOf<Parameters<NotificationClick>>().toEqualTypeOf<ExNotificationEmits['click']>();
    expectTypeOf<CardInstance['$emit']>().toEqualTypeOf<EmitFn<ExCardEmits>>();
    expectTypeOf<NotificationInstance['$emit']>().toEqualTypeOf<EmitFn<ExNotificationEmits>>();
  });

  it('真实 SFC 的 @click 与 @click.once 参数推断保持现有类型', async () => {
    const wrapper = mount(ListenerParameterTypes);
    wrappers.push(wrapper);
    await nextTick();
    await wrapper.get('.ex-card__primary-action').trigger('click');
    await wrapper.get('.ex-notification').trigger('click');
  });
});
