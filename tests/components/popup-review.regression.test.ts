import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExDropdown from '../../src/components/dropdown/ExDropdown.vue';
import ExPopover from '../../src/components/popover/ExPopover.vue';
import ExTooltip from '../../src/components/tooltip/ExTooltip.vue';
import ExModal from '../../src/components/modal/ExModal.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.useRealTimers();
});

describe('浮层触发器和键盘退出的复查回归', () => {
  it.each([
    { name: 'Dropdown', component: ExDropdown },
    { name: 'Popover', component: ExPopover },
    { name: 'Tooltip', component: ExTooltip },
  ])('$name 切换触发方式撤销旧的延迟打开和关闭', async ({ component, name }) => {
    vi.useFakeTimers();
    const wrapper = mount(component, {
      props: { trigger: 'hover', openDelay: 100, showDelay: 100, closeDelay: 100, hideDelay: 100 },
      slots: { default: () => h('button', '触发') },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    const trigger = name === 'Dropdown' ? wrapper.get('.ex-dropdown__trigger') : wrapper;
    await trigger.trigger('mouseenter');
    await wrapper.setProps({ trigger: 'click' });
    await vi.advanceTimersByTimeAsync(150);
    expect(wrapper.emitted('show')).toBeUndefined();
    await wrapper.setProps({ trigger: 'hover' });
    await trigger.trigger('mouseenter');
    await vi.advanceTimersByTimeAsync(150);
    expect(wrapper.emitted('show')).toHaveLength(1);
    await trigger.trigger('mouseleave');
    await wrapper.setProps({ trigger: 'click' });
    await vi.advanceTimersByTimeAsync(150);
    expect(wrapper.emitted('hide')).toBeUndefined();
  });

  it('Popover 替换触发按钮后建立新关联，释放时保留父级最新的 ARIA', async () => {
    const key = ref(0);
    const controls = ref('原面板');
    const popover = ref<InstanceType<typeof ExPopover>>();
    const visible = ref(true);
    const wrapper = mount({
      render: () =>
        h(ExPopover, { ref: popover, modelValue: visible.value, content: '内容' }, () =>
          h('button', { key: key.value, 'aria-controls': controls.value }, '触发')
        ),
    });
    wrappers.push(wrapper);
    await nextTick();
    const previous = wrapper.get('button').element;
    const panel = previous.getAttribute('aria-controls');
    key.value += 1;
    await nextTick();
    expect(previous.getAttribute('aria-controls')).toBe('原面板');
    expect(wrapper.get('button').attributes('aria-controls')).toBe(panel);
    controls.value = '新的业务面板';
    await nextTick();
    const current = wrapper.get('button').element;
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(current.getAttribute('aria-controls')).toBe('新的业务面板');
  });

  it.each([false, true])('模态内 Dropdown 的 Tab 退出遵守触发器顺序，反向=%s', async reverse => {
    const wrapper = mount(ExModal, {
      props: { modelValue: true, showClose: false, showFooter: false },
      slots: {
        default: () => [
          h('button', { id: 'before-dropdown' }, '之前'),
          h(ExDropdown, { trigger: 'click', items: [{ key: 'item', label: '选项' }] }, () =>
            h('button', '打开')
          ),
          h('button', { id: 'after-dropdown' }, '之后'),
        ],
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await nextTick();
    await wrapper.getComponent(ExDropdown).get('button').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    const menu = document.querySelector<HTMLElement>('.ex-dropdown__menu')!;
    menu.focus();
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: reverse,
        bubbles: true,
        cancelable: true,
      })
    );
    await nextTick();
    expect(document.activeElement?.id).toBe(reverse ? 'before-dropdown' : 'after-dropdown');
    expect(menu.style.display).toBe('none');
  });
});
