import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import Modal from '../../src/components/modal/ExModal.vue';
import Dialog from '../../src/components/dialog/ExDialog.vue';
import Drawer from '../../src/components/drawer/ExDrawer.vue';
import Dropdown from '../../src/components/dropdown/ExDropdown.vue';
import Popover from '../../src/components/popover/ExPopover.vue';
import Tooltip from '../../src/components/tooltip/ExTooltip.vue';
import Config from '../../src/components/config-provider/ExConfigProvider.vue';
import { useGuardedVisibility } from '../../src/composables/useGuardedVisibility';
import { calcPopperPosition } from '../../src/utils/popper';
import { useOverlay } from '../../src/composables/useOverlay';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});
const flush = async () => {
  await nextTick();
  await nextTick();
  await nextTick();
};

for (const [name, renderPanel] of Object.entries({
  Modal: () => h(Modal, { modelValue: true }, () => '子面板'),
  Dialog: () => h(Dialog, { modelValue: true }, () => '子面板'),
  Drawer: () => h(Drawer, { modelValue: true }, () => '子面板'),
})) {
  it(`${name} 保留的子面板随父层隐藏并能重新显示`, async () => {
    const open = ref(true);
    mount(
      defineComponent(() => () => h(Modal, { modelValue: open.value }, () => renderPanel())),
      { attachTo: document.body }
    );
    await flush();
    const selector = name === 'Modal' ? '.ex-modal-root' : `.ex-${name.toLowerCase()}-wrapper`;
    const panels = document.querySelectorAll<HTMLElement>(selector);
    const panel = panels[panels.length - 1]!;
    expect(panel).toBeDefined();
    open.value = false;
    await flush();
    expect(panel.style.display).toBe('none');
    open.value = true;
    await flush();
    expect(panel.style.display).not.toBe('none');
  });
}

it('焦点圈闭跳过隐藏祖先内的控件', async () => {
  mount(Modal, {
    props: { modelValue: true, showClose: false, showFooter: false },
    slots: {
      default: () => [
        h('div', { style: 'display:none' }, h('button', { id: 'hidden' }, '隐藏')),
        h('button', { id: 'visible' }, '可见'),
      ],
    },
    attachTo: document.body,
  });
  await flush();
  const button = document.getElementById('visible')!;
  button.focus();
  button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  expect(document.activeElement).toBe(button);
});

it('销毁使尚未完成的打开和关闭守卫失效', async () => {
  for (const phase of ['open', 'close'] as const) {
    let resolve!: (allowed: boolean) => void;
    const request = vi.fn();
    const onOpen = vi.fn();
    let state!: ReturnType<typeof useGuardedVisibility>;
    const wrapper = mount(
      defineComponent({
        setup() {
          state = useGuardedVisibility({
            modelValue: () => true,
            [phase === 'open' ? 'beforeOpen' : 'beforeClose']: () => () =>
              new Promise<boolean>(done => {
                resolve = done;
              }),
            requestModelValue: request,
            onOpen,
          });
          return () => h('div');
        },
      })
    );
    const pending = phase === 'close' ? state.requestClose() : undefined;
    onOpen.mockClear();
    wrapper.unmount();
    resolve(true);
    if (pending) await expect(pending).resolves.toBe(false);
    await flushPromises();
    expect(request).not.toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
    state.requestOpen();
    await expect(state.requestClose()).resolves.toBe(false);
    expect(request).not.toHaveBeenCalled();
  }
});

it('Dropdown 位于父 Modal 上方并继承品牌覆盖，父层关闭后隐藏', async () => {
  const open = ref(true);
  mount(Config, {
    props: { themeOverrides: { '--ex-color-primary': 'red' } },
    slots: {
      default: () =>
        h(Modal, { modelValue: open.value, zIndex: 3000 }, () =>
          h(Dropdown, { visible: true }, () => h('button', '打开'))
        ),
    },
    attachTo: document.body,
  });
  await flush();
  const menu = document.querySelector<HTMLElement>('.ex-dropdown__menu')!;
  expect(Number(menu.style.zIndex)).toBeGreaterThan(3000);
  expect(menu.style.getPropertyValue('--ex-color-primary')).toBe('red');
  open.value = false;
  await flush();
  expect(menu.style.display).toBe('none');
});

it('Dropdown 卸载后排队的任务不再注册文档监听器', async () => {
  const add = vi.spyOn(document, 'addEventListener');
  const wrapper = mount(Dropdown, { props: { visible: true } });
  wrapper.unmount();
  await flush();
  expect(add.mock.calls.filter(([event]) => event === 'pointerdown')).toHaveLength(0);
});

it('Dropdown 输入法确认不触发打开或选中', async () => {
  const wrapper = mount(Dropdown, { slots: { default: () => h('input') } });
  await wrapper.get('input').trigger('keydown', { key: 'Enter', isComposing: true, keyCode: 229 });
  expect(wrapper.emitted('update:visible')).toBeUndefined();
});

for (const [name, component] of Object.entries({ Popover, Tooltip })) {
  it(`${name} 打开后修改位置会重新计算`, async () => {
    const wrapper = mount(component, {
      props: { modelValue: true, placement: 'top' },
      slots: { default: () => h('button', '打开') },
    });
    await flush();
    await wrapper.setProps({ placement: 'bottom' });
    await flush();
    expect(document.querySelector(`.ex-${name.toLowerCase()}__popper--bottom`)).not.toBeNull();
  });
}

it('Popover 旧版位置别名保留正确方向及对齐', () => {
  const trigger = {
    top: 100,
    bottom: 120,
    left: 100,
    right: 200,
    width: 100,
    height: 20,
  } as DOMRect;
  expect(calcPopperPosition(trigger, { width: 40, height: 20 }, 'bottomRight', 10)).toEqual({
    top: 130,
    left: 160,
    placement: 'bottom-end',
  });
});

it('非浮层布局容器可保持后代作用域，切入关闭的移动模式时隐藏后代', async () => {
  const mobile = ref(false);
  const Boundary = defineComponent({
    setup(_, { slots }) {
      useOverlay({
        active: () => false,
        scopeActive: () => !mobile.value,
        container: ref(),
        zIndex: () => 8000,
      });
      return () => h('aside', slots.default?.());
    },
  });
  mount(Boundary, { slots: { default: () => h(Dropdown, { visible: true }) } });
  await flush();
  const panel = document.querySelector<HTMLElement>('.ex-dropdown__menu')!;
  expect(panel.style.display).not.toBe('none');
  expect(Number(panel.style.zIndex)).toBeLessThan(8000);
  mobile.value = true;
  await flush();
  expect(panel.style.display).toBe('none');
});
