import { enableAutoUnmount, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { compile } from 'sass-embedded';
import { compileStyle } from '@vue/compiler-sfc';
import Message from '../../src/components/message/ExMessage.vue';
import Notification from '../../src/components/notification/ExNotification.vue';
import Popconfirm from '../../src/components/popconfirm/ExPopconfirm.vue';
import Progress from '../../src/components/progress/ExProgress.vue';
import Config from '../../src/components/config-provider/ExConfigProvider.vue';
import Tabs from '../../src/components/tabs/ExTabs.vue';
import Pane from '../../src/components/tabs/ExTabPane.vue';
import LoadingPlugin from '../../src/components/loading/LoadingService';
import { createMessageService } from '../../src/components/message/message';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
});
const flush = async () => {
  await nextTick();
  await nextTick();
  await nextTick();
};

it('Message 悬停离开时仍保留焦点暂停原因', async () => {
  vi.useFakeTimers();
  const wrapper = mount(Message, { props: { duration: 1000, closable: true } });
  await flush();
  const root = wrapper.get('.ex-message');
  await root.trigger('mouseenter');
  await root.trigger('focusin');
  await root.trigger('mouseleave');
  await vi.advanceTimersByTimeAsync(1200);
  expect(wrapper.emitted('close')).toBeUndefined();
  await root.trigger('focusout');
  await vi.advanceTimersByTimeAsync(1000);
  expect(wrapper.emitted('close')).toHaveLength(1);
});

it('Message 分组创建修复被外部移除的宿主', async () => {
  const service = createMessageService();
  service.config({ grouping: true, duration: 0 });
  try {
    service('同一消息');
    document.querySelector('.ex-message-container')!.remove();
    service('同一消息');
    await flush();
    expect(document.querySelector('.ex-message-container')).not.toBeNull();
  } finally {
    service.closeAll();
  }
});

it('Notification 内部按钮空格保留原生行为，输入法不激活通知', async () => {
  const click = vi.fn();
  const wrapper = mount(Notification, { props: { duration: 0, onClick: click } });
  const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
  wrapper.get('button').element.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  await wrapper.get('.ex-notification').trigger('keydown', { key: 'Enter', isComposing: true });
  expect(click).not.toHaveBeenCalled();
});

it('Popconfirm 所有显示入口发送一致的变化事件', async () => {
  const wrapper = mount(Popconfirm);
  wrapper.vm.show();
  await flush();
  wrapper.vm.hide();
  await flush();
  expect(wrapper.emitted('update:visible')).toEqual([[true], [false]]);
});

it('Popconfirm 旧确认不能关闭 Escape 后重新打开的一轮', async () => {
  let resolve!: (value: boolean) => void;
  const pending = new Promise<boolean>(done => {
    resolve = done;
  });
  const wrapper = mount(Popconfirm, { props: { beforeConfirm: () => pending } });
  wrapper.vm.show();
  await flush();
  document.querySelectorAll<HTMLButtonElement>('.ex-popconfirm__footer button')[1]!.click();
  await flush();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flush();
  wrapper.vm.show();
  await flush();
  resolve(true);
  await flush();
  expect(wrapper.emitted('confirm')).toBeUndefined();
  expect(document.querySelector('.ex-popconfirm')).not.toBeNull();
});

it('v-loading 遮罩关闭后可以再次开启', async () => {
  const loading = ref(true);
  mount(
    defineComponent({
      setup: () => ({ loading }),
      template: '<div v-loading="{loading,config:{maskClosable:true}}" />',
    }),
    { attachTo: document.body, global: { plugins: [LoadingPlugin] } }
  );
  await flush();
  document.querySelector<HTMLElement>('.ex-loading__mask')!.click();
  await flush();
  loading.value = false;
  await flush();
  loading.value = true;
  await flush();
  expect(document.querySelector('.ex-loading')).not.toBeNull();
});

it('Progress 线性模式不创建波浪帧循环', async () => {
  const frame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  const wrapper = mount(Progress, { props: { percentage: 0, type: 'line', waveAnimated: false } });
  frame.mockClear();
  await wrapper.setProps({ waveAnimated: true });
  expect(frame).not.toHaveBeenCalled();
});

it('Progress 波浪模式支持颜色函数且遵守 Provider 动画开关', async () => {
  const frame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  const color = vi.fn(() => 'red');
  mount(Config, {
    props: { animation: false },
    slots: { default: () => h(Progress, { type: 'wave', percentage: 50, color }) },
  });
  await flush();
  expect(color).toHaveBeenCalledWith(50);
  expect(frame).not.toHaveBeenCalled();
});

for (const type of ['wave', 'wave-circle'] as const) {
  it(`Progress ${type} 兑现数组渐变色`, () => {
    const wrapper = mount(Progress, {
      props: {
        percentage: 50,
        type,
        waveAnimated: false,
        color: [
          { percentage: 100, color: 'blue' },
          { percentage: 0, color: 'red' },
        ],
      },
    });
    const stops = wrapper.findAll('stop');
    expect(stops.map(stop => stop.attributes('stop-color'))).toEqual(['red', 'blue']);
    expect(stops.map(stop => stop.attributes('offset'))).toEqual(['0%', '100%']);
    const secondary = wrapper.get(
      type === 'wave'
        ? '.ex-progress__wave-path--secondary'
        : '.ex-progress__wave-circle-path--secondary'
    );
    expect(secondary.attributes('fill')).toMatch(/^url\(#ex-wave/);
  });
}

it('Tabs animated=false 禁用组件自己的过渡', () => {
  const style = document.createElement('style');
  style.textContent = compile('src/components/tabs/ExTabs.scss').css;
  document.head.append(style);
  const wrapper = mount(Tabs, {
    props: { animated: false },
    slots: { default: () => h(Pane, { name: 'a' }) },
    attachTo: document.body,
  });
  try {
    expect(getComputedStyle(wrapper.get('.ex-tabs__indicator').element).transition).toBe('none');
  } finally {
    style.remove();
  }
});

const styleCases = [
  ['tooltip', 'ExTooltip', 'ex-tooltip__popper', '', 'pointerEvents', 'auto'],
  [
    'message',
    'ExMessage',
    'ex-message ex-message--loading ex-message--no-animation',
    'ex-message__icon-loading',
    'animation',
    'none',
  ],
  [
    'notification',
    'ExNotification',
    'ex-notification ex-notification--no-animation ex-notification-fade-leave-active',
    '',
    'animation',
    'none',
  ],
  [
    'loading',
    'ExLoading',
    'ex-loading ex-loading--pulse ex-loading--no-animation',
    'ex-loading__pulse-ring',
    'opacity',
    '1',
  ],
] as const;
for (const [directory, file, classes, childClass, property, expected] of styleCases) {
  it(`${file} 的独立浮层样式兑现交互和动画开关`, () => {
    const filename = `src/components/${directory}/${file}.scss`;
    const scopeId = 'data-v-feedback-style';
    const compiled = compileStyle({
      source: compile(filename).css,
      filename,
      id: scopeId,
      scoped: true,
    });
    expect(compiled.errors).toEqual([]);
    const style = document.createElement('style');
    style.textContent = compiled.code;
    document.head.append(style);
    const root = document.createElement('div');
    root.className = classes;
    root.setAttribute(scopeId, '');
    const child = document.createElement('span');
    if (childClass) {
      child.className = childClass;
      child.setAttribute(scopeId, '');
      root.append(child);
    }
    document.body.append(root);
    try {
      expect(getComputedStyle(childClass ? child : root)[property]).toBe(expected);
    } finally {
      style.remove();
    }
  });
}
